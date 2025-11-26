package com.glassbox.backend.service;

import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class GitService {

    public File cloneRepo(String gitUrl, String branch) throws IOException, InterruptedException {
        String tempDirName = "repo-" + UUID.randomUUID();
        File tempDir = Files.createTempDirectory(tempDirName).toFile();

        ProcessBuilder pb;
        if (branch != null && !branch.isEmpty()) {
            pb = new ProcessBuilder("git", "clone", "-b", branch, "--depth", "1", gitUrl, tempDir.getAbsolutePath());
        } else {
            pb = new ProcessBuilder("git", "clone", "--depth", "1", gitUrl, tempDir.getAbsolutePath());
        }

        pb.inheritIO();
        Process process = pb.start();
        boolean finished = process.waitFor(5, TimeUnit.MINUTES);

        if (!finished || process.exitValue() != 0) {
            throw new IOException("Failed to clone repository: " + gitUrl);
        }

        return tempDir;
    }

    public void cleanup(File dir) {
        if (dir != null && dir.exists()) {
            try {
                Files.walk(dir.toPath())
                        .sorted(Comparator.reverseOrder())
                        .map(Path::toFile)
                        .forEach(File::delete);
            } catch (IOException e) {
                System.err.println("Failed to cleanup temp directory: " + e.getMessage());
            }
        }
    }
}
