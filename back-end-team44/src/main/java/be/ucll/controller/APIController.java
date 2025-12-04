package be.ucll.controller;

import be.ucll.model.Alarm;
import be.ucll.model.Batch;
import be.ucll.model.Severity;
import be.ucll.service.AlarmService;
import be.ucll.service.CSVService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class APIController {
    private final AlarmService alarmService;
    private final CSVService csvService;

    @Autowired
    public APIController(AlarmService alarmService, CSVService csvService) {
        this.alarmService = alarmService;
        this.csvService = csvService;
    }

    //GET /api/alarms
    @GetMapping("/alarms")
    public List<Alarm> getAllAlarms(
            @RequestParam(required = false) Integer productionStep,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam(required = false) Severity severity
    ) {
        return alarmService.getAllAlarms(productionStep, startDate, severity);
    }

    //GET /api/alarms/{id}
    @GetMapping("/alarms/{alarmId}")
    public Alarm getAlarmById(@PathVariable Long alarmId) {
        return alarmService.getById(alarmId);
    }

    //GET /api/alarms/batch/{batchId}
    @GetMapping("/alarms/batch/{batchId}")
    public Batch getBatch(@PathVariable UUID batchId) {
        return alarmService.getBatchFromId(batchId);
    }

    //GET /api/alarms/statistics
    @GetMapping("/alarms/statistics")
    public String getStatistics() {
        return "No statistics yet.";
    }

    //GET /api/batches
    @GetMapping("/batches")
    public List<Batch> getAllBatches() {
        return alarmService.getAllBatches();
    }

    //GET /api/batches/export
    @Operation(summary = "Export batches to CSV")
    @ApiResponse(responseCode = "200", description = "CSV file generated successfully")
    @GetMapping("/batches/export")
    public void exportBatchesToCSV(HttpServletResponse response, @RequestParam String format)
            throws IOException, InterruptedException {
        if (format.equals("csv")) {
            List<Batch> batches = alarmService.getAllBatches();

            // Convert entity → JSON fields expected by Python
            List<Map<String, Object>> batchMaps = batches.stream().map(batch -> {
                Map<String, Object> map = new HashMap<>();
                map.put("batchId", batch.getBatchId());
                map.put("batchNumber", batch.getBatchNumber());
                map.put("productionOrderNumber", batch.getProductionOrderNumber());
                map.put("recipeId", batch.getRecipeId());
                map.put("plannedStartTime", batch.getPlannedStartTime());
                map.put("actualStartTime", batch.getActualStartTime());
                map.put("plannedEndTime", batch.getPlannedEndTime());
                map.put("actualEndTime", batch.getActualEndTime());
                map.put("executionStatus", batch.getExecutionStatus());
                map.put("internalId", batch.getInternalId());
                map.put("name", batch.getName());
                return map;
            }).toList();

            // Generate CSV via Python
            File csvFile = csvService.generateCSV(batchMaps);

            // Stream CSV to client
            response.setContentType("text/csv");
            response.setHeader("Content-Disposition", "attachment; filename=\"batches_export.csv\"");

            try (InputStream is = new FileInputStream(csvFile);
                 OutputStream os = response.getOutputStream()) {

                byte[] buffer = new byte[8192];
                int len;
                while ((len = is.read(buffer)) != -1) {
                    os.write(buffer, 0, len);
                }
            }

            csvFile.delete();
        } else {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Unsupported format: " + format);
        }
    }
}
