package be.ucll.service;

import be.ucll.model.Alarm;
import be.ucll.model.Batch;
import be.ucll.model.Severity;
import be.ucll.repository.AlarmRepository;
import be.ucll.repository.BatchRepository;

import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class AlarmService {
    private final AlarmRepository alarmRepository;
    private final BatchService batchService;
    private final BatchRepository batchRepository;

    public AlarmService(AlarmRepository alarmRepository, BatchService batchService, BatchRepository batchRepository) {
        this.alarmRepository = alarmRepository;
        this.batchService = batchService;
        this.batchRepository = batchRepository;
    }

    public Alarm getById(Long alarmId) {
        if (alarmRepository.existsById(alarmId)) {
            return alarmRepository.findAlarmById(alarmId);
        } else {
            throw new RuntimeException("Alarm with id " + alarmId + " does not exist!");
        }
    }

    public Batch getBatchFromId(UUID batchId) {
        return batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch with id " + batchId + " does not exist!"));
    }

    public List<Alarm> getAllAlarms(Integer productionStep, Date startDate, Severity severity) {
        List<Alarm> alarms = alarmRepository.findAll();

        return alarms.stream()
                .filter(a -> productionStep == null || a.getProductionStep() == productionStep)
                .filter(a -> startDate == null || !a.getStartDate().before(startDate))
                .filter(a -> severity == null || a.getSeverity() == severity)
                .toList();
    }

    public List<Batch> getAllBatches() {
        return batchRepository.findAll();
    }
}
