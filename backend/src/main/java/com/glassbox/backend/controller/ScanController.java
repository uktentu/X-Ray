package com.glassbox.backend.controller;

import com.glassbox.backend.service.BuildService;
import com.glassbox.backend.service.GitService;
import com.glassbox.backend.service.JarScannerService;
import com.glassbox.backend.service.ReportService;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/scan")
@CrossOrigin(origins = "*") // Allow all origins for development
public class ScanController {

    private final JarScannerService jarScannerService;
    private final GitService gitService;
    private final BuildService buildService;
    private final ReportService reportService;

    public ScanController(JarScannerService jarScannerService, GitService gitService, BuildService buildService, ReportService reportService) {
        this.jarScannerService = jarScannerService;
        this.gitService = gitService;
        this.buildService = buildService;
        this.reportService = reportService;
    }

    @PostMapping("/analyze")
    public Map<String, Object> analyze(@RequestBody Map<String, String> request) {
        String projectPath = request.get("projectPath");
        String targetGroupId = request.get("targetGroupId");
        String gitUrl = request.get("gitUrl");
        String branch = request.get("branch");

        System.out.println("Received scan request. GitURL: " + gitUrl + ", Path: " + projectPath + ", Target: " + targetGroupId);

        File tempRepoDir = null;
        try {
            if (gitUrl != null && !gitUrl.isEmpty()) {
                System.out.println("Cloning repository...");
                tempRepoDir = gitService.cloneRepo(gitUrl, branch);
                System.out.println("Cloned to: " + tempRepoDir.getAbsolutePath());

                System.out.println("Building project...");
                buildService.buildProject(tempRepoDir);
                System.out.println("Build complete.");

                // Heuristic: Assume src/main/java exists in the root
                // In a real app, we might need to find where the source is
                projectPath = new File(tempRepoDir, "src/main/java").getAbsolutePath();
            }

            List<String> targetGroupIds = Arrays.stream(targetGroupId.split(","))
                                                .map(String::trim)
                                                .filter(s -> !s.isEmpty())
                                                .collect(Collectors.toList());

            Map<String, Object> result = jarScannerService.scanProject(projectPath, targetGroupIds);
            
            String reportPath = reportService.saveReport(result, gitUrl != null ? "git-repo" : "local-project");
            System.out.println("Report saved to: " + reportPath);
            
            return result;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Scan failed: " + e.getMessage());
        } finally {
            if (tempRepoDir != null) {
                System.out.println("Cleaning up temp directory...");
                gitService.cleanup(tempRepoDir);
            }
        }
    }
}
