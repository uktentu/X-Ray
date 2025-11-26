package com.glassbox.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class ReportService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final File reportsDir = new File("reports");

    public ReportService() {
        if (!reportsDir.exists()) {
            reportsDir.mkdirs();
        }
    }

    public String saveReport(Map<String, Object> graphData, String projectName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        String safeProjectName = projectName.replaceAll("[^a-zA-Z0-9.-]", "_");
        String filename = safeProjectName + "_" + timestamp + ".json";
        File reportFile = new File(reportsDir, filename);

        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(reportFile, graphData);
            return reportFile.getAbsolutePath();
        } catch (IOException e) {
            System.err.println("Failed to save report: " + e.getMessage());
            return null;
        }
    }
}
