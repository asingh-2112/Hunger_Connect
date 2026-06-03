package com.noHunger.Hunger_Connect.service;

import com.noHunger.Hunger_Connect.dto.request.*;
import com.noHunger.Hunger_Connect.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshTokenRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    void logout(String refreshToken);
}
