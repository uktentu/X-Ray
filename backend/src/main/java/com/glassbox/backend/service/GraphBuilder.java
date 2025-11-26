package com.glassbox.backend.service;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.expr.MethodCallExpr;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class GraphBuilder {

    private final DecompilerService decompilerService;
    private final JarResolverService jarResolverService;

    public GraphBuilder(DecompilerService decompilerService, JarResolverService jarResolverService) {
        this.decompilerService = decompilerService;
        this.jarResolverService = jarResolverService;
    }

    public Map<String, Object> buildGraph(String projectPath, List<String> targetGroupIds) {
        List<Map<String, Object>> nodes = new ArrayList<>();
        List<Map<String, Object>> edges = new ArrayList<>();
        Map<String, String> visitedClasses = new HashMap<>();
        
        // Counters for layout
        AtomicInteger sourceCount = new AtomicInteger(0);
        AtomicInteger depCount = new AtomicInteger(0);

        File projectDir = new File(projectPath);
        if (!projectDir.exists() || !projectDir.isDirectory()) {
            throw new IllegalArgumentException("Invalid project path: " + projectPath);
        }

        scanDirectory(projectDir, nodes, edges, targetGroupIds, visitedClasses, sourceCount, depCount);

        return Map.of("nodes", nodes, "edges", edges);
    }

    private void scanDirectory(File dir, List<Map<String, Object>> nodes, List<Map<String, Object>> edges, List<String> targetGroupIds, Map<String, String> visitedClasses, AtomicInteger sourceCount, AtomicInteger depCount) {
        File[] files = dir.listFiles();
        if (files == null) return;

        for (File file : files) {
            if (file.isDirectory()) {
                scanDirectory(file, nodes, edges, targetGroupIds, visitedClasses, sourceCount, depCount);
            } else if (file.getName().endsWith(".java")) {
                parseJavaFile(file, nodes, edges, targetGroupIds, visitedClasses, sourceCount, depCount);
            }
        }
    }

    private void parseJavaFile(File file, List<Map<String, Object>> nodes, List<Map<String, Object>> edges, List<String> targetGroupIds, Map<String, String> visitedClasses, AtomicInteger sourceCount, AtomicInteger depCount) {
        try {
            CompilationUnit cu = StaticJavaParser.parse(file);
            
            cu.findAll(MethodDeclaration.class).forEach(method -> {
                String sourceMethodName = method.getNameAsString();
                String sourceClassName = cu.getPrimaryTypeName().orElse("Unknown");
                String sourceId = sourceClassName + "." + sourceMethodName;

                if (!visitedClasses.containsKey(sourceId)) {
                    int y = sourceCount.getAndIncrement() * 150;
                    nodes.add(Map.of(
                        "id", sourceId,
                        "label", sourceId,
                        "type", "source",
                        "position", Map.of("x", 0, "y", y),
                        "data", Map.of("label", sourceId, "subLabel", "Source Code", "code", method.toString())
                    ));
                    visitedClasses.put(sourceId, "source");
                }

                method.accept(new VoidVisitorAdapter<Void>() {
                    @Override
                    public void visit(MethodCallExpr n, Void arg) {
                        super.visit(n, arg);
                        
                        cu.getImports().stream()
                            .forEach(imp -> {
                                String importName = imp.getNameAsString();
                                String matchingGroupId = targetGroupIds.stream()
                                    .filter(gid -> importName.startsWith(gid))
                                    .findFirst()
                                    .orElse(null);
                                
                                if (matchingGroupId != null) {
                                    String simpleClassName = importName.substring(importName.lastIndexOf('.') + 1);
                                    
                                    boolean match = false;
                                    if (n.getScope().isPresent()) {
                                        String scope = n.getScope().get().toString();
                                        if (scope.equals(simpleClassName)) {
                                            match = true; 
                                        } else {
                                            boolean isField = cu.findAll(com.github.javaparser.ast.body.FieldDeclaration.class).stream()
                                                .anyMatch(f -> f.getVariables().stream()
                                                    .anyMatch(v -> v.getNameAsString().equals(scope) && v.getTypeAsString().equals(simpleClassName)));
                                            if (isField) match = true;
                                        }
                                    }
                                    
                                    if (match) {
                                        String targetMethodName = n.getNameAsString();
                                        String targetId = simpleClassName + "." + targetMethodName;
                                        
                                        if (!visitedClasses.containsKey(targetId)) {
                                            String code = "// Could not resolve JAR";
                                            var jarPathOpt = jarResolverService.findJarContainingClass(matchingGroupId, simpleClassName);
                                            
                                            if (jarPathOpt.isPresent()) {
                                                code = decompilerService.decompile(jarPathOpt.get(), simpleClassName);
                                            }
                                            
                                            int y = depCount.getAndIncrement() * 150;
                                            nodes.add(Map.of(
                                                "id", targetId,
                                                "label", targetId,
                                                "type", "dependency",
                                                "position", Map.of("x", 500, "y", y),
                                                "data", Map.of("label", targetId, "subLabel", "Decompiled", "code", code)
                                            ));
                                            visitedClasses.put(targetId, "dependency");
                                        }
                                        
                                        edges.add(Map.of(
                                            "id", sourceId + "-" + targetId,
                                            "source", sourceId,
                                            "target", targetId,
                                            "animated", true,
                                            "label", "calls"
                                        ));
                                    }
                                }
                            });
                    }
                }, null);
            });

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
