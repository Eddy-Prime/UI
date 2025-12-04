package be.ucll.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import be.ucll.model.User;
import be.ucll.service.auth.LoginResponse;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    public User findByEmail(String email);

    public Optional<User> findByName(String name);

}
