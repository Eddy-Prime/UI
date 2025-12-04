package be.ucll.unit.model;

import be.ucll.model.User;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.ValidatorFactory;
import jakarta.validation.Validator;

import org.junit.jupiter.api.Test;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;

public class UserUnitTest {
    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    public static void createValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @Test
    public void givenUserWithoutAName_whenCreatingUser_thenErrorWithMessageIsThrown() {
        User user = new User("  ", "john.doe@ucll.be", "john1234");

        Set<ConstraintViolation<User>> violations = validator.validate(user);

        assertEquals(1, violations.size());
        ConstraintViolation<User> violation = violations.iterator().next();
        assertEquals("Name is required.", violation.getMessage());
    }

    @Test
    public void givenUserWithoutAnEmail_whenCreatingUser_thenErrorWithMessageIsThrown() {
        User user = new User("John Doe", "  ", "john1234");

        Set<ConstraintViolation<User>> violations = validator.validate(user);

        assertEquals(1, violations.size());
        ConstraintViolation<User> violation = violations.iterator().next();
        assertEquals("Email is required.", violation.getMessage());
    }

    @Test
    public void givenUserWithoutAPassword_whenCreatingUser_thenErrorWithMessageIsThrown() {
        User user = new User("John Doe", "john.doe@ucll.be", "  ");

        Set<ConstraintViolation<User>> violations = validator.validate(user);

        assertEquals(1, violations.size());
        ConstraintViolation<User> violation = violations.iterator().next();
        assertEquals("Password is required.", violation.getMessage());
    }
    
}
