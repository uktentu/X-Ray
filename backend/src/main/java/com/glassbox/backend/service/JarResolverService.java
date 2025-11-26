package com.glassbox.backend.service;

import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.stream.Stream;

@Service
public class JarResolverService {

    private final String m2Repository = System.getProperty("user.home") + "/.m2/repository";

    public Optional<String> findJarContainingClass(String groupId, String className) {
        // Convert groupId to path
        String groupPath = groupId.replace('.', '/');
        Path startPath = Paths.get(m2Repository, groupPath);

        if (!Files.exists(startPath)) {
            return Optional.empty();
        }

        // Search for JARs in the group directory
        try (Stream<Path> walk = Files.walk(startPath)) {
            return walk
                    .filter(p -> p.toString().endsWith(".jar"))
                    .filter(p -> !p.toString().endsWith("-sources.jar"))
                    .filter(p -> !p.toString().endsWith("-javadoc.jar"))
                    .filter(p -> containsClass(p, className))
                    .map(Path::toString)
                    .findFirst();
        } catch (IOException e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }

    private boolean containsClass(Path jarPath, String className) {
        // Simple check: does the JAR contain the class file?
        // We can use java.util.jar.JarFile
        try (java.util.jar.JarFile jarFile = new java.util.jar.JarFile(jarPath.toFile())) {
            // className is like "PaymentLib", we need "com/myorg/payment/PaymentLib.class"
            // But we might not know the full package if we only have the simple name.
            // However, GraphBuilder should ideally pass the full qualified name if possible.
            // If we only have simple name, we iterate entries.
            
            return jarFile.stream().anyMatch(entry -> 
                entry.getName().endsWith("/" + className + ".class") || 
                entry.getName().equals(className + ".class")
            );
        } catch (IOException e) {
            return false;
        }
    }
}
