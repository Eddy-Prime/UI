package be.ucll.unit.integration;

// import be.ucll.repository.DbInitializer;
import be.ucll.repository.UserRepository;

// import be.ucll.repository.PublicationRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
// @Sql("classpath:schema.sql")
public class UserControllerTest {

    @Autowired
    private WebTestClient client;

    @Autowired
    private UserRepository userRepository;

    // @Autowired
    // private DbInitializer dbInitializer;

    // //GET request

    // @BeforeEach
    // public void setUp() {
    //     dbInitializer.initialize();
    // }

    @Test
    public void whenRegisterUser_thenUserIsRegistered(){
        client.post()
                .uri("/auth/register")
                .header("Content-Type", "application/json")
                .bodyValue("""
                                {
                                    "name": "Alice Johnson",
                                    "email": "alice.johnson@example.com",
                                    "password": "SecurePass123!"
                                    }
                        """)
                        
                .exchange()
                .expectStatus().is2xxSuccessful()
                .expectBody()
                .json("""
                        {
                            "id": 5,
                            "name": "Alice Johnson",
                            "email": "alice.johnson@example.com",
                            "loginResponses": [],
                            "username": "alice.johnson@example.com"
                        }    
                        """   
                );
            Assertions.assertEquals(userRepository.findByEmail("alice.johnson@example.com").getEmail(), "alice.johnson@example.com");
    }

    // @Test
    // public void whenLoginUser_thenUserIsLoggedIn(){
    //     client.post()
    //             .uri("/auth/login")
    //             .header("Content-Type", "application/json")
    //             .bodyValue("""
    //                             {
    //                                 "email": "tom.boon@ucll.be",
    //                                 "password": "tom123"
    //                                 }
    //                     """)
    //             .exchange()
    //             .expectStatus().is2xxSuccessful()
    //             .expectBody()
}
