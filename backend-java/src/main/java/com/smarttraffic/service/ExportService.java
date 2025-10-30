package com.smarttraffic.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.smarttraffic.dto.RoadDTO;
import com.smarttraffic.dto.TrafficStatsDTO;
import com.smarttraffic.model.OptimizationRecommendation;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Export service for generating PDF, Excel, and CSV reports
 * Converted from TypeScript exportUtils.ts
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ExportService {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    /**
     * Generate PDF traffic analytics report
     */
    public byte[] generatePdfReport(AnalyticsData data) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            
            // Header
            document.add(new Paragraph("Traffic Analytics Report")
                .setFontSize(20)
                .setBold());
            document.add(new Paragraph("Generated: " + LocalDateTime.now().format(DATE_FORMATTER))
                .setFontSize(12));
            document.add(new Paragraph("\n"));
            
            // Summary metrics
            document.add(new Paragraph("Summary Metrics").setFontSize(16).setBold());
            document.add(new Paragraph("System Efficiency: " + data.getSystemEfficiency() + "%"));
            document.add(new Paragraph("Average Wait Time: " + data.getAvgWaitTime() + "s"));
            document.add(new Paragraph("Total Throughput: " + data.getTotalThroughput() + " vehicles"));
            document.add(new Paragraph("Emergency Events: " + data.getEmergencyEvents()));
            document.add(new Paragraph("\n"));
            
            // Road performance table
            document.add(new Paragraph("Road Performance").setFontSize(16).setBold());
            Table table = new Table(5);
            table.addHeaderCell("Road");
            table.addHeaderCell("Vehicles");
            table.addHeaderCell("Wait Time (s)");
            table.addHeaderCell("Efficiency (%)");
            table.addHeaderCell("Queue Length");
            
            for (RoadPerformanceData road : data.getRoadPerformance()) {
                table.addCell(road.getRoadName());
                table.addCell(String.valueOf(road.getVehicles()));
                table.addCell(String.valueOf(road.getWaitTime()));
                table.addCell(String.valueOf(road.getEfficiency()));
                table.addCell(String.valueOf(road.getQueueLength()));
            }
            
            document.add(table);
            document.add(new Paragraph("\n"));
            
            // Recommendations
            if (!data.getRecommendations().isEmpty()) {
                document.add(new Paragraph("Optimization Recommendations").setFontSize(16).setBold());
                for (RecommendationData rec : data.getRecommendations()) {
                    document.add(new Paragraph(String.format("[%s] %s: %s", 
                        rec.getSeverity(), rec.getRoadName(), rec.getRecommendation())));
                }
            }
            
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Error generating PDF report", e);
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }
    
    /**
     * Generate Excel traffic analytics report
     */
    public byte[] generateExcelReport(AnalyticsData data) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            
            // Create sheets
            Sheet summarySheet = workbook.createSheet("Summary");
            Sheet roadSheet = workbook.createSheet("Road Performance");
            Sheet recommendationsSheet = workbook.createSheet("Recommendations");
            
            // Summary sheet
            int summaryRow = 0;
            Row row = summarySheet.createRow(summaryRow++);
            row.createCell(0).setCellValue("Traffic Analytics Report");
            
            row = summarySheet.createRow(summaryRow++);
            row.createCell(0).setCellValue("Generated:");
            row.createCell(1).setCellValue(LocalDateTime.now().format(DATE_FORMATTER));
            
            summaryRow++; // Empty row
            
            row = summarySheet.createRow(summaryRow++);
            row.createCell(0).setCellValue("Metric");
            row.createCell(1).setCellValue("Value");
            
            row = summarySheet.createRow(summaryRow++);
            row.createCell(0).setCellValue("System Efficiency");
            row.createCell(1).setCellValue(data.getSystemEfficiency() + "%");
            
            row = summarySheet.createRow(summaryRow++);
            row.createCell(0).setCellValue("Average Wait Time");
            row.createCell(1).setCellValue(data.getAvgWaitTime() + "s");
            
            row = summarySheet.createRow(summaryRow++);
            row.createCell(0).setCellValue("Total Throughput");
            row.createCell(1).setCellValue(data.getTotalThroughput());
            
            row = summarySheet.createRow(summaryRow++);
            row.createCell(0).setCellValue("Emergency Events");
            row.createCell(1).setCellValue(data.getEmergencyEvents());
            
            // Road performance sheet
            int roadRow = 0;
            Row headerRow = roadSheet.createRow(roadRow++);
            headerRow.createCell(0).setCellValue("Road");
            headerRow.createCell(1).setCellValue("Vehicles");
            headerRow.createCell(2).setCellValue("Wait Time (s)");
            headerRow.createCell(3).setCellValue("Efficiency (%)");
            headerRow.createCell(4).setCellValue("Queue Length");
            headerRow.createCell(5).setCellValue("Peak Traffic");
            
            for (RoadPerformanceData road : data.getRoadPerformance()) {
                Row dataRow = roadSheet.createRow(roadRow++);
                dataRow.createCell(0).setCellValue(road.getRoadName());
                dataRow.createCell(1).setCellValue(road.getVehicles());
                dataRow.createCell(2).setCellValue(road.getWaitTime());
                dataRow.createCell(3).setCellValue(road.getEfficiency());
                dataRow.createCell(4).setCellValue(road.getQueueLength());
                dataRow.createCell(5).setCellValue(road.getPeakTraffic());
            }
            
            // Recommendations sheet
            int recRow = 0;
            Row recHeaderRow = recommendationsSheet.createRow(recRow++);
            recHeaderRow.createCell(0).setCellValue("Road");
            recHeaderRow.createCell(1).setCellValue("Severity");
            recHeaderRow.createCell(2).setCellValue("Recommendation");
            recHeaderRow.createCell(3).setCellValue("Estimated Impact");
            
            for (RecommendationData rec : data.getRecommendations()) {
                Row recDataRow = recommendationsSheet.createRow(recRow++);
                recDataRow.createCell(0).setCellValue(rec.getRoadName());
                recDataRow.createCell(1).setCellValue(rec.getSeverity());
                recDataRow.createCell(2).setCellValue(rec.getRecommendation());
                recDataRow.createCell(3).setCellValue(rec.getEstimatedImpact());
            }
            
            // Auto-size columns
            for (int i = 0; i < 6; i++) {
                summarySheet.autoSizeColumn(i);
                roadSheet.autoSizeColumn(i);
                recommendationsSheet.autoSizeColumn(i);
            }
            
            workbook.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            log.error("Error generating Excel report", e);
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }
    
    /**
     * Generate CSV traffic analytics report
     */
    public byte[] generateCsvReport(AnalyticsData data) {
        StringBuilder csv = new StringBuilder();
        
        // Header
        csv.append("Traffic Analytics Report\n");
        csv.append("Generated,").append(LocalDateTime.now().format(DATE_FORMATTER)).append("\n\n");
        
        // Summary
        csv.append("Summary Metrics\n");
        csv.append("Metric,Value\n");
        csv.append("System Efficiency,").append(data.getSystemEfficiency()).append("%\n");
        csv.append("Average Wait Time,").append(data.getAvgWaitTime()).append("s\n");
        csv.append("Total Throughput,").append(data.getTotalThroughput()).append("\n");
        csv.append("Emergency Events,").append(data.getEmergencyEvents()).append("\n\n");
        
        // Road performance
        csv.append("Road Performance\n");
        csv.append("Road,Vehicles,Wait Time (s),Efficiency (%),Queue Length (m),Peak Traffic\n");
        for (RoadPerformanceData road : data.getRoadPerformance()) {
            csv.append(road.getRoadName()).append(",")
               .append(road.getVehicles()).append(",")
               .append(road.getWaitTime()).append(",")
               .append(road.getEfficiency()).append(",")
               .append(road.getQueueLength()).append(",")
               .append(road.getPeakTraffic()).append("\n");
        }
        
        csv.append("\n");
        
        // Recommendations
        if (!data.getRecommendations().isEmpty()) {
            csv.append("Recommendations\n");
            csv.append("Road,Severity,Recommendation,Impact\n");
            for (RecommendationData rec : data.getRecommendations()) {
                csv.append(rec.getRoadName()).append(",")
                   .append(rec.getSeverity()).append(",")
                   .append(escapeCSV(rec.getRecommendation())).append(",")
                   .append(rec.getEstimatedImpact()).append("\n");
            }
        }
        
        return csv.toString().getBytes();
    }
    
    /**
     * Escape CSV special characters
     */
    private String escapeCSV(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
    
    /**
     * Analytics data container for exports
     */
    @Data
    public static class AnalyticsData {
        private Double systemEfficiency;
        private Double avgWaitTime;
        private Integer totalThroughput;
        private Integer emergencyEvents;
        private List<RoadPerformanceData> roadPerformance;
        private List<RecommendationData> recommendations;
    }
    
    @Data
    public static class RoadPerformanceData {
        private String roadName;
        private Integer vehicles;
        private Double waitTime;
        private Double efficiency;
        private Integer queueLength;
        private String peakTraffic;
    }
    
    @Data
    public static class RecommendationData {
        private String roadName;
        private String severity;
        private String recommendation;
        private String estimatedImpact;
    }
}
