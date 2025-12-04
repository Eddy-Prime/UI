package be.ucll.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import be.ucll.model.Program;

public interface ProgramRepository extends JpaRepository<Program, Long> {

}