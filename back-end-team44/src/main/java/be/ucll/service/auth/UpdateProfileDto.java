package be.ucll.service.auth;

import jakarta.validation.constraints.NotBlank;

public class UpdateProfileDto {
    
    @NotBlank(message = "Full name is required.")
    private String name;
    
    private String preferredName;

    public UpdateProfileDto() {}

    public UpdateProfileDto(String name, String preferredName) {
        this.name = name;
        this.preferredName = preferredName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name == null ? null : name.trim();
    }

    public String getPreferredName() {
        return preferredName;
    }

    public void setPreferredName(String preferredName) {
        this.preferredName = preferredName == null ? null : preferredName.trim();
    }
}