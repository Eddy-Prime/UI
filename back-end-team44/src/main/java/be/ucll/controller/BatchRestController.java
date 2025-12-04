package be.ucll.controller;

import be.ucll.model.Batch;
import be.ucll.service.BatchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/batches")
public class BatchRestController {

    private final BatchService batchService;

    public BatchRestController(BatchService batchService) {
        this.batchService = batchService;
    }

    @GetMapping("/{batchId}/parameters")
    public Batch getBatchParameters(@PathVariable("batchId") UUID batchId) {
        return batchService.getBatchParameters(batchId);
    }
    @GetMapping("/dashboard/batch-stats")
    public String getBatchStats(){
        return batchService.getBatchStats();
    }
}
