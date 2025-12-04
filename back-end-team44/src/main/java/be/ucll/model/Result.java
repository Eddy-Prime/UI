package be.ucll.model;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Table(name = "results")
@Entity
public class Result {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String gameHome;
    private String gameOut;
    private int scoreHome;
    private int scoreOut;

    public Result() {
    }

    public Result(String gameHome, String gameOut, int scoreHome, int scoreOut) {
        setGameHome(gameHome);
        setGameOut(gameOut);
        setScoreHome(scoreHome);
        setScoreOut(scoreOut);
    }

    public String getGameHome() {
        return gameHome;
    }

    public String getGameOut() {
        return gameOut;
    }

    public int getScoreHome() {
        return scoreHome;
    }

    public int getScoreOut() {
        return scoreOut;
    }

    public void setGameOut(String gameOut2) {
        this.gameOut = gameOut2;
    }

    public void setGameHome(String gameHome2) {
        this.gameHome = gameHome2;
    }

    public void setScoreOut(int scoreOut) {
        this.scoreOut = scoreOut;
    }

    public void setScoreHome(int scoreHome) {
        this.scoreHome = scoreHome;
    }

}
