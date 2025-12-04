package be.ucll.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "alarms")
public class Alarm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int productionStep;

    private Date startDate; //When the alarm was triggered.

    @NotNull
    @Enumerated(EnumType.STRING)
    private Severity severity;

    @OneToMany
    private List<Batch> batches;

    protected Alarm() {}

    public Alarm(int productionStep, Date startDate, Severity severity, List<Batch> batches) {
        this.productionStep = productionStep;
        this.startDate = startDate;
        this.severity = severity;
        this.batches = batches;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getProductionStep() {
        return productionStep;
    }

    public void setProductionStep(int productionStep) {
        this.productionStep = productionStep;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public List<Batch> getBatches() {
        return batches;
    }

    public void setBatches(List<Batch> batches) {
        this.batches = batches;
    }
}
