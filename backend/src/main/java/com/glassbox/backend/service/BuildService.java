package com.glassbox.backend.service;

import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Service
public class BuildService {

    public void buildProject(File projectDir) throws IOException, InterruptedException {
        // Assume Maven is installed and available in PATH
        // We use -DskipTests to speed up the build
        ProcessBuilder pb = new ProcessBuilder("mvn", "clean", "install", "-DskipTests");
        pb.directory(projectDir);
        pb.inheritIO();

        Process process = pb.start();
        boolean finished = process.waitFor(10, TimeUnit.MINUTES);

        if (!finished || process.exitValue() != 0) {
            throw new IOException("Failed to build project in: " + projectDir.getAbsolutePath());
        }
    }
}
