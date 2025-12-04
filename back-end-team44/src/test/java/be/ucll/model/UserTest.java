package be.ucll.model;

import be.ucll.model.User;
import org.junit.jupiter.api.Test;
import jakarta.validation.*;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;

public class UserTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void shouldCreateValidUser() {
        User user = new User("John Doe", "john.doe@example.com", "password123");

        Set<ConstraintViolation<User>> violations = validator.validate(user);
        assertTrue(violations.isEmpty(), "User should be valid");
    }

    @Test
    void shouldFailWhenEmailIsInvalid() {
        User user = new User("John Doe", "invalid-email", "password123");

        Set<ConstraintViolation<User>> violations = validator.validate(user);
        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailWhenPasswordIsEmpty() {
        User user = new User("John Doe", "john@example.com", "");

        Set<ConstraintViolation<User>> violations = validator.validate(user);
        assertFalse(violations.isEmpty());
    }
}