package be.ucll.service.auth;

import be.ucll.model.User;

public interface AuthenticationService {
    User register(UserRegisterDto userInput);
    User login(LoginUserDto userInput, boolean foundUser);
}
