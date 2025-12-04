package be.ucll.service;

import java.util.List;
import java.util.Optional;

import org.hibernate.service.spi.ServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import be.ucll.model.User;
import be.ucll.repository.UserRepository;
import be.ucll.service.auth.AuthenticationService;
import be.ucll.service.auth.UserRegisterDto;
import be.ucll.service.auth.LoginUserDto;
import be.ucll.service.auth.UpdateProfileDto;

@Service
public class UserService {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private AuthenticationService authenticationService;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            AuthenticationService authenticationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationService = authenticationService;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User registUser(UserRegisterDto userInput) {
        User existingUser = userRepository.findByEmail(userInput.getEmail());

        if (existingUser != null) {
            throw new ServiceException("User already exists.");
        }
        authenticationService.register(userInput);
        return userRepository.findByEmail(userInput.getEmail());
    }

    public User loginUser(LoginUserDto userInput) {
        String email = userInput.getEmail();
        String password = userInput.getPassword();

        User existingUser = userRepository.findByEmail(email);

        if (email == null | email == "") {
            throw new ServiceException("Email is required");
        }

        if (password == null | password == "") {
            throw new ServiceException("Password is required");
        }
        if (existingUser != null && passwordEncoder.matches(password, existingUser.getPassword())) {
            authenticationService.login(userInput, true);

        } else {
            throw new ServiceException("Invalid email or password.");
        }
        return userRepository.findByEmail(userInput.getEmail());
    }

    public User updateProfile(String email, UpdateProfileDto updateData) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ServiceException("User not found");
        }

        user.setName(updateData.getName());
        user.setPreferredName(updateData.getPreferredName());
        
        return userRepository.save(user);
    }

    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ServiceException("User not found");
        }
        
        // Delete user account and associated login responses
        userRepository.delete(user);
    }
}
