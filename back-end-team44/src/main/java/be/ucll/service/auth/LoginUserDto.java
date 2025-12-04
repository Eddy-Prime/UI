package be.ucll.service.auth;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class LoginUserDto {
    private String email;
    private String password;
    private List<LoginResponse> loginResponses = new ArrayList<LoginResponse>();

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<LoginResponse> getLoginResonses() {

        return loginResponses;
    }

    public void addLoginResponse(LoginResponse loginResponse) {
        loginResponses.add(loginResponse);
    }

}
