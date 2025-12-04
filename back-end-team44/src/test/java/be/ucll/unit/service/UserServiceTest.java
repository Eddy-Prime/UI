package be.ucll.unit.service;

import be.ucll.model.User;
import be.ucll.repository.UserRepository;
import be.ucll.service.auth.AuthenticationService;
import be.ucll.service.auth.LoginUserDto;
import be.ucll.service.auth.UserRegisterDto;
import org.hibernate.service.spi.ServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.junit.jupiter.api.Assertions;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import be.ucll.service.UserService;

public class UserServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private AuthenticationService authenticationService;
    private UserService service;

    @BeforeEach
    public void setup() {
        userRepository = Mockito.mock(UserRepository.class);
        passwordEncoder = Mockito.mock(PasswordEncoder.class);
        authenticationService = Mockito.mock(AuthenticationService.class);
        service = new UserService(userRepository, passwordEncoder, authenticationService);
    }

    // --- getAllUsers ---

    @Test
    public void given3Users_whenGetAllUsers_thenReturnAll() {
        User user1 = new User("John Doe", "john.doe@ucll.be", "john123");
        User user2 = new User("Jane Smith", "jane.smith@ucll.be", "jane123");
        User user3 = new User("Bob Brown", "bob.brown@ucll.be", "bob123");

        Mockito.when(userRepository.findAll()).thenReturn(List.of(user1, user2, user3));

        List<User> result = service.getAllUsers();

        Assertions.assertEquals(3, result.size());
        Assertions.assertEquals("john.doe@ucll.be", result.get(0).getEmail());
        verify(userRepository, times(1)).findAll();
    }

    // --- registUser (happy path) ---

    @Test
    public void givenValidUser_whenRegisterUser_thenRegistersSuccessfully() {
        UserRegisterDto dto = new UserRegisterDto();
        dto.setName("Peter");
        dto.setEmail("peter@ucll.be");
        dto.setPassword("password123");

        Mockito.when(userRepository.findByEmail(Mockito.anyString()))
                .thenReturn(null, new User("Peter", "peter@ucll.be", "password123"));

        Mockito.when(authenticationService.register(dto))
                .thenReturn(new User("Peter", "peter@ucll.be", "password123"));

        User result = service.registUser(dto);

        verify(authenticationService, times(1)).register(dto);
        Assertions.assertEquals("peter@ucll.be", result.getEmail());
    }

    // --- registUser (unhappy path) ---

    @Test
    public void givenExistingUser_whenRegisterUser_thenThrowsServiceException() {
        UserRegisterDto dto = new UserRegisterDto();
        dto.setName("Alice");
        dto.setEmail("alice@ucll.be");
        dto.setPassword("password123");
        Mockito.when(userRepository.findByEmail(dto.getEmail()))
                .thenReturn(new User("Alice", "alice@ucll.be", "password123"));

        ServiceException exception = Assertions.assertThrows(ServiceException.class, () -> {
            service.registUser(dto);
        });

        Assertions.assertEquals("User already exists.", exception.getMessage());
    }

    // --- loginUser (happy path) ---

    @Test
    public void givenValidCredentials_whenLoginUser_thenReturnsUser() {
        LoginUserDto dto = new LoginUserDto();
        dto.setEmail("john.doe@ucll.be");
        dto.setPassword("john123");
        User mockUser = new User("John Doe", "john.doe@ucll.be", "encodedPass");

        Mockito.when(userRepository.findByEmail(dto.getEmail())).thenReturn(mockUser);
        Mockito.when(passwordEncoder.matches(dto.getPassword(), mockUser.getPassword())).thenReturn(true);
        Mockito.when(userRepository.findByEmail(dto.getEmail())).thenReturn(mockUser);

        User result = service.loginUser(dto);

        verify(authenticationService, times(1)).login(dto, true);
        Assertions.assertEquals("john.doe@ucll.be", result.getEmail());
    }

    // --- loginUser (invalid email) ---

    @Test
    public void givenEmptyEmail_whenLoginUser_thenThrowsServiceException() {
        LoginUserDto dto = new LoginUserDto();
        dto.setEmail("");
        dto.setPassword("john123");

        ServiceException exception = Assertions.assertThrows(ServiceException.class, () -> {
            service.loginUser(dto);
        });

        Assertions.assertEquals("Email is required", exception.getMessage());
    }

    // --- loginUser (invalid password) ---

    @Test
    public void givenEmptyPassword_whenLoginUser_thenThrowsServiceException() {
        LoginUserDto dto = new LoginUserDto();
        dto.setEmail("john.doe@ucll.be");
        dto.setPassword("");

        ServiceException exception = Assertions.assertThrows(ServiceException.class, () -> {
            service.loginUser(dto);
        });

        Assertions.assertEquals("Password is required", exception.getMessage());
    }

    // --- loginUser (incorrect password) ---

    @Test
    public void givenWrongPassword_whenLoginUser_thenThrowsServiceException() {
        LoginUserDto dto = new LoginUserDto();
        dto.setEmail("john.doe@ucll.be");
        dto.setPassword("wrongPassword");
        User mockUser = new User("John Doe", "john.doe@ucll.be", "encodedPass");

        Mockito.when(userRepository.findByEmail(dto.getEmail())).thenReturn(mockUser);
        Mockito.when(passwordEncoder.matches(dto.getPassword(), mockUser.getPassword())).thenReturn(false);

        ServiceException exception = Assertions.assertThrows(ServiceException.class, () -> {
            service.loginUser(dto);
        });

        Assertions.assertEquals("Invalid email or password.", exception.getMessage());
    }
}

