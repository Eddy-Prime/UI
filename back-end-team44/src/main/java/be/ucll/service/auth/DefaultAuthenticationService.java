package be.ucll.service.auth;

import be.ucll.model.User;
import be.ucll.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class DefaultAuthenticationService implements AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public DefaultAuthenticationService(UserRepository userRepository,
                                        PasswordEncoder passwordEncoder,
                                        AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public User register(UserRegisterDto userInput) {
        User user = new User(userInput.getName(), userInput.getEmail(),
                passwordEncoder.encode(userInput.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public User login(LoginUserDto userInput, boolean foundUser) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userInput.getEmail(), userInput.getPassword())
        );
        return userRepository.findByEmail(userInput.getEmail());
    }
}
