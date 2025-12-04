package be.ucll.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.List;
import java.util.Map;

@Service
public class CSVService {

    private final ObjectMapper objectMapper;

    public CSVService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    public File generateCSV(List<Map<String, Object>> batchData)
            throws IOException, InterruptedException {

        String jsonInput = objectMapper.writeValueAsString(batchData);

        ProcessBuilder pb = new ProcessBuilder(
                "python3",
                "src/main/resources/generate_csv.py"
        );

        Process process = pb.start();

        try (BufferedWriter writer =
                     new BufferedWriter(new OutputStreamWriter(process.getOutputStream()))) {
            writer.write(jsonInput);
        }

        String filename;
        try (BufferedReader reader =
                     new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            filename = reader.readLine();
        }

        int exitCode = process.waitFor();

        if (exitCode != 0 || filename == null || filename.isEmpty()) {
            throw new RuntimeException("Python CSV generation failed (exit " + exitCode + ")");
        }

        return new File(filename);
    }
}