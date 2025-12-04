package be.ucll.repository;

import be.ucll.model.Alarm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlarmRepository extends JpaRepository<Alarm, Long> {
    Alarm findAlarmById(Long id);
}
