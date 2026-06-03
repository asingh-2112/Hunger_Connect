package com.noHunger.Hunger_Connect.service;

public interface EmailService {
    void sendPasswordResetEmail(String to, String name, String resetLink);
    void sendWelcomeEmail(String to, String name);
}
