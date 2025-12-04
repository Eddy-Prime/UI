package be.ucll.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import be.ucll.model.Result;

public interface ResultRepository extends JpaRepository<Result, Long> {

}
