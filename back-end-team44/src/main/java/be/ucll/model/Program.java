package be.ucll.model;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Table(name = "programs")
@Entity
public class Program {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String gameHome;
    private String gameOut;
    private LocalTime game_hour;
    private LocalDate game_date;

    public Program() {
    }

    public Program(String gameHome, String gameOut, LocalDate date, LocalTime hour) {
        setGameHome(gameHome);
        setGameOut(gameOut);
        setDate(date);
        setHour(hour);
    }

    public Long getId() {
        return id;
    }

    public String getGameHome() {
        return gameHome;
    }

    public String getGameOut() {
        return gameOut;
    }

    public LocalDate getDate() {
        return game_date;
    }

    public LocalTime getHour() {
        return game_hour;
    }

    public void setGameHome(String gameHome) {
        this.gameHome = gameHome;
    }

    public void setGameOut(String gameOut) {
        this.gameOut = gameOut;
    }

    public void setDate(LocalDate date) {
        this.game_date = date;
    }

    public void setHour(LocalTime hour) {
        this.game_hour = hour;
    }
}
