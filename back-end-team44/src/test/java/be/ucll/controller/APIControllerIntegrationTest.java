package be.ucll.controller;

import be.ucll.model.Alarm;
import be.ucll.model.Batch;
import be.ucll.model.Severity;
import be.ucll.service.AlarmService;
import be.ucll.service.CSVService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.ArrayList;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class APIControllerIntegrationTest {

    private MockMvc mockMvc;
    private AlarmService alarmService;
    private CSVService csvService;

    private Alarm alarm;

    @BeforeEach
    void setUp() {
        // Stub AlarmService without Mockito
        alarm = new Alarm(1, new Date(), Severity.Critical, List.of());
        alarm.setId(1L);

        alarmService = new AlarmService(null, null,  null) {
            @Override
            public Alarm getById(Long alarmId) {
                if (alarmId == 1L)
                    return alarm;
                throw new RuntimeException("Alarm not found");
            }

            @Override
            public List<Alarm> getAllAlarms(Integer productionStep, Date startDate, Severity severity) {
                // Return a list containing the preset alarm if it matches filters
                List<Alarm> list = new ArrayList<>();
                boolean matches = (productionStep == null || alarm.getProductionStep() == productionStep)
                        && (startDate == null || !alarm.getStartDate().before(startDate))
                        && (severity == null || alarm.getSeverity() == severity);
                if (matches)
                    list.add(alarm);
                return list;
            }

            @Override
            public Batch getBatchFromId(UUID batchId) {
                Batch batch = new Batch(
                        "B12345",
                        "PO-6789",
                        "RCP-222",
                        LocalDateTime.now(),
                        LocalDateTime.now(),
                        LocalDateTime.now().plusHours(4),
                        null,
                        "PLANNED",
                        123L,
                        "Test Batch");
                batch.setBatchId(batchId);
                return batch;
            }

            @Override
            public List<Batch> getAllBatches() {
                return List.of();
            }
        };

        // Stub CSVService to avoid external process
        csvService = new CSVService() {
            @Override
            public File generateCSV(List<Map<String, Object>> batchData) throws IOException, InterruptedException {
                File temp = File.createTempFile("test-batches", ".csv");
                try (FileWriter fw = new FileWriter(temp)) {
                    fw.write("id,name\n");
                }
                return temp;
            }
        };

        APIController controller = new APIController(alarmService, csvService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void givenNoParams_whenGetAllAlarms_thenReturnAllAlarms() throws Exception {
        mockMvc.perform(get("/api/alarms")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].severity").value("Critical"));
    }

    @Test
    void givenProductionStepParam_whenGetAllAlarms_thenReturnFilteredByStep() throws Exception {
        mockMvc.perform(get("/api/alarms")
                .param("productionStep", "1")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productionStep").value(1));
    }

    @Test
    void givenSeverityParam_whenGetAllAlarms_thenReturnFilteredBySeverity() throws Exception {
        mockMvc.perform(get("/api/alarms")
                .param("severity", "Critical")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].severity").value("Critical"));
    }

    @Test
    void givenAlarmId_whenGetAlarmById_thenReturnAlarm() throws Exception {
        mockMvc.perform(get("/api/alarms/1")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void givenBatchId_whenGetBatch_thenReturnBatch() throws Exception {
        Batch batch = new Batch(
                "B12345", // batchNumber
                "PO-6789", // productionOrderNumber
                "RCP-222", // recipeId
                LocalDateTime.now(), // plannedStartTime
                LocalDateTime.now(), // actualStartTime
                LocalDateTime.now().plusHours(4), // plannedEndTime
                null, // actualEndTime
                "PLANNED", // executionStatus
                123L, // internalId
                "Test Batch" // name
        );
        UUID id = UUID.randomUUID();
        mockMvc.perform(get("/api/alarms/batch/" + id)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("TestBatch"));
    }

    @Test
    void givenStatisticsEndpoint_whenGetStatistics_thenReturnPlaceholderMessage() throws Exception {
        mockMvc.perform(get("/api/alarms/statistics")
                .accept(MediaType.TEXT_PLAIN))
                .andExpect(status().isOk())
                .andExpect(content().string("No statistics yet."));
    }
}
