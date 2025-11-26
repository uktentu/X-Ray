package com.glassbox.backend.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class JarScannerService {

    private final GraphBuilder graphBuilder;

    public JarScannerService(GraphBuilder graphBuilder) {
        this.graphBuilder = graphBuilder;
    }

    public Map<String, Object> scanProject(String projectPath, List<String> targetGroupIds) {
        return graphBuilder.buildGraph(projectPath, targetGroupIds);
    }
}
