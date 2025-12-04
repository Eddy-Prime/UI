// package be.ucll.repository;

// import java.time.LocalDate;
// import java.time.LocalTime;

// import org.springframework.beans.factory.annotation.Autowired;
// import be.ucll.model.*;
// import org.springframework.stereotype.Component;

// import be.ucll.model.User;
// import be.ucll.model.Program;
// import be.ucll.model.Result;
// import jakarta.annotation.PostConstruct;

// @Component
// public class DbInitializer {

//     private UserRepository userRepository;
//     private ProgramRepository programRepository;
//     private ResultRepository resultRepository;

//     @Autowired
//     public DbInitializer(UserRepository userRepository, ProgramRepository programRepository,
//             ResultRepository resultRepository) {
//         this.userRepository = userRepository;
//         this.programRepository = programRepository;
//         this.resultRepository = resultRepository;
//     }

//     @PostConstruct
//     public void initialize() {

//         User user1 = new User("Tom Boon", "tom.boon@ucll.be", "tom123");
//         User user2 = new User("Loick Luypaert", "loick.luypaert@ucll.be", "loick123");

//         userRepository.save(user1);
//         userRepository.save(user2);

//         Program program1 = new Program("Braxgam", "Victory", LocalDate.of(2025, 10, 04), LocalTime.of(15, 00));
//         Program program2 = new Program("Leopolo", "Braxgam", LocalDate.of(2025, 10, 11), LocalTime.of(16, 30));

//         programRepository.save(program1);
//         programRepository.save(program2);

//         Result result1 = new Result("Braxgam", "Leopolo", 5, 0);
//         Result result2 = new Result("Victory", "Braxgam", 1, 11);
//         Result result3 = new Result("Leopolo", "Victory", 2, 0);

//         resultRepository.save(result1);
//         resultRepository.save(result2);
//         resultRepository.save(result3);

//     }

