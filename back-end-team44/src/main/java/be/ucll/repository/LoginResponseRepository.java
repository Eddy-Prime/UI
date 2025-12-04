package be.ucll.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import be.ucll.service.auth.LoginResponse;
import java.util.List;

@Repository
public interface LoginResponseRepository extends JpaRepository<LoginResponse, Long> {
    Optional<LoginResponse> findByToken(String token);

    void deleteByToken(String token);
}
