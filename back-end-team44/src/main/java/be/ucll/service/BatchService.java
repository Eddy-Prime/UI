package be.ucll.service;

import be.ucll.model.Batch;
import be.ucll.repository.BatchRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;


@Service
public class BatchService {

    private final BatchRepository batchRepository;

    public BatchService(BatchRepository batchRepository) {
        this.batchRepository = batchRepository;
    }

    public Batch getBatchParameters(UUID batchId) {
        return batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch with id " + batchId + " does not exist!"));
    }

    public List<Batch> getAllBatches(){
        return batchRepository.findAll();
    }

    public String getBatchStats(){
        List<Batch> allBatches = this.getAllBatches();
        int totalBatches = allBatches.size();

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<Batch> batchesThisWeek = new ArrayList<>();
        List<Batch> failedBatchesThisWeek = new ArrayList<>();

        long totalDurationMinutes = 0;
        int completedBatchesCount = 0;
        int passedBatches = 0;

        for (Batch batch : allBatches) {
            // Count batches from this week
            if (batch.getActualEndTime() != null &&
                    batch.getActualEndTime().isAfter(sevenDaysAgo)) {
                batchesThisWeek.add(batch);

                // Count failed batches this week
                if ("ABORTED".equals(batch.getExecutionStatus())) {
                    failedBatchesThisWeek.add(batch);
                }
            }

            // Calculate duration for completed batches
            if (batch.getActualStartTime() != null &&
                    batch.getActualEndTime() != null) {
                Duration duration = Duration.between(
                        batch.getActualStartTime(),
                        batch.getActualEndTime()
                );
                totalDurationMinutes += duration.toMinutes();
                completedBatchesCount++;
            }

            // Count batches that passed (not ABORTED or FAILED)
            String status = batch.getExecutionStatus();
            if (status != null &&
                    !"ABORTED".equals(status) &&
                    !"FAILED".equals(status)) {
                passedBatches++;
            }
        }

        // Calculate average duration in hours
        double avgBatchDuration = completedBatchesCount > 0
                ? (totalDurationMinutes / 60.0) / completedBatchesCount
                : 0.0;

        // Calculate success rate
        double successRate = totalBatches > 0
                ? (passedBatches * 100.0) / totalBatches
                : 0.0;

        return """
            {
                "totalBatches": %d,
                "batchesThisWeek": %d,
                "successRate": %.2f%%,
                "failedBatchesThisWeek": %d,
                "avgBatchDuration": %.2f hours
            }
            """.formatted(
                totalBatches,
                batchesThisWeek.size(),
                successRate,
                failedBatchesThisWeek.size(),
                avgBatchDuration
        );
    }
}
