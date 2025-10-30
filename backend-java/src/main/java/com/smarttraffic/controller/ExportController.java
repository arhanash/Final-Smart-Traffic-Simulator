package com.smarttraffic.controller;

import com.smarttraffic.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * REST controller for report exports (PDF, Excel, CSV)
 */
@RestController
@RequestMapping("/export")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExportController {
    
    private final ExportService exportService;
    private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");
    
    /**
     * Export analytics as PDF
     * POST /api/export/pdf
     */
    @PostMapping("/pdf")
    public ResponseEntity<byte[]> exportPdf(@RequestBody ExportService.AnalyticsData data) {
        byte[] pdfBytes = exportService.generatePdfReport(data);
        
        String filename = "traffic-report-" + LocalDateTime.now().format(FILE_DATE_FORMAT) + ".pdf";
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdfBytes);
    }
    
    /**
     * Export analytics as Excel
     * POST /api/export/excel
     */
    @PostMapping("/excel")
    public ResponseEntity<byte[]> exportExcel(@RequestBody ExportService.AnalyticsData data) {
        byte[] excelBytes = exportService.generateExcelReport(data);
        
        String filename = "traffic-report-" + LocalDateTime.now().format(FILE_DATE_FORMAT) + ".xlsx";
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(excelBytes);
    }
    
    /**
     * Export analytics as CSV
     * POST /api/export/csv
     */
    @PostMapping("/csv")
    public ResponseEntity<byte[]> exportCsv(@RequestBody ExportService.AnalyticsData data) {
        byte[] csvBytes = exportService.generateCsvReport(data);
        
        String filename = "traffic-data-" + LocalDateTime.now().format(FILE_DATE_FORMAT) + ".csv";
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csvBytes);
    }
}
