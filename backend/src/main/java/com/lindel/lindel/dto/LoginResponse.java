package com.lindel.lindel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    
    private String token;
    private String type = "Bearer";
    private String username;
    private String name;
    private String email;
    private String role;
}
