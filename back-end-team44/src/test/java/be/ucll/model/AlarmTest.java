package be.ucll.model;

import be.ucll.repository.AlarmRepository;
import be.ucll.repository.BatchRepository;
import be.ucll.service.AlarmService;
import be.ucll.service.BatchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AlarmTest {

    private AlarmRepository alarmRepository;
    private BatchService batchService;
    private AlarmService alarmService;
    private BatchRepository batchRepository;

    @BeforeEach
    void setUp() {
        alarmRepository = mock(AlarmRepository.class);
        batchService = mock(BatchService.class);
        batchRepository = mock(BatchRepository.class);
        alarmService = new AlarmService(alarmRepository, batchService, batchRepository);
    }

    @Test
    void givenExistingAlarms_whenGetAllAlarmsWithoutFilters_thenReturnAll() {
        when(alarmRepository.findAll()).thenReturn(List.of(new Alarm(), new Alarm()));

        List<Alarm> result = alarmService.getAllAlarms(null, null, null);

        assertEquals(2, result.size());
        verify(alarmRepository, times(1)).findAll();
    }

    @Test
    void givenSeverityFilter_whenGetAllAlarms_thenReturnMatchingAlarms() {
        Alarm alarm = new Alarm(1, new Date(), Severity.Critical, List.of());
        when(alarmRepository.findAll()).thenReturn(List.of(alarm));

        List<Alarm> result = alarmService.getAllAlarms(null, null, Severity.Critical);

        assertEquals(1, result.size());
        assertEquals(Severity.Critical, result.get(0).getSeverity());
        verify(alarmRepository).findAll();
    }

    @Test
    void givenProductionStepFilter_whenGetAllAlarms_thenReturnMatchingAlarms() {
        Alarm alarm = new Alarm(2, new Date(), Severity.Warning, List.of());
        when(alarmRepository.findAll()).thenReturn(List.of(alarm));

        List<Alarm> result = alarmService.getAllAlarms(2, null, null);

        assertEquals(1, result.size());
        assertEquals(2, result.get(0).getProductionStep());
        verify(alarmRepository).findAll();
    }

    @Test
    void givenExistingAlarmId_whenGetById_thenReturnAlarm() {
        Alarm alarm = new Alarm();
        alarm.setId(1L);
        when(alarmRepository.existsById(1L)).thenReturn(true);
        when(alarmRepository.findAlarmById(1L)).thenReturn(alarm);

        Alarm result = alarmService.getById(1L);

        assertEquals(1L, result.getId());
        verify(alarmRepository).findAlarmById(1L);
    }

    @Test
    void givenNonExistingAlarmId_whenGetById_thenThrowException() {
        when(alarmRepository.existsById(99L)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> alarmService.getById(99L));

        assertTrue(ex.getMessage().contains("does not exist"));
        verify(alarmRepository, never()).findAlarmById(anyLong());
    }

    @Test
    void givenExistingBatchId_whenGetBatchFromId_thenReturnBatch() {
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
        when(batchRepository.findById(id)).thenReturn(Optional.of(batch));

        Batch result = alarmService.getBatchFromId(id);

        assertEquals("TestBatch", result.getName());
        verify(batchRepository).findById(id);
    }

    @Test
    void givenNonExistingBatchId_whenGetBatchFromId_thenThrowException() {
        UUID missing = UUID.randomUUID();
        when(batchRepository.findById(missing)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> alarmService.getBatchFromId(missing));

        assertTrue(ex.getMessage().contains("does not exist"));
        verify(batchRepository).findById(missing);
    }
}
