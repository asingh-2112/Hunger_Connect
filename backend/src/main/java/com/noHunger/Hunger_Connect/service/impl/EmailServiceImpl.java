package com.noHunger.Hunger_Connect.service.impl;

import com.noHunger.Hunger_Connect.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Override
    @Async
    public void sendPasswordResetEmail(String to, String name, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject("Reset your Hunger Connect password");
            helper.setText(buildPasswordResetHtml(name, resetLink), true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendWelcomeEmail(String to, String name) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject("Welcome to Hunger Connect!");
            helper.setText(buildWelcomeHtml(name), true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send welcome email to {}: {}", to, e.getMessage());
        }
    }

    private String buildPasswordResetHtml(String name, String resetLink) {
        return """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #e53e3e;">Hunger Connect — Password Reset</h2>
                  <p>Hi %s,</p>
                  <p>We received a request to reset your password. Click the button below to create a new one:</p>
                  <a href="%s" style="display:inline-block; background:#e53e3e; color:#fff; padding:12px 24px;
                     text-decoration:none; border-radius:4px; margin:16px 0;">Reset Password</a>
                  <p>This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.</p>
                  <p style="color:#718096; font-size:12px;">© 2024 Hunger Connect. Fighting hunger together.</p>
                </body>
                </html>
                """.formatted(name, resetLink);
    }

    private String buildWelcomeHtml(String name) {
        return """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #e53e3e;">Welcome to Hunger Connect!</h2>
                  <p>Hi %s,</p>
                  <p>Thank you for joining Hunger Connect. Together we can fight food waste and hunger.</p>
                  <p style="color:#718096; font-size:12px;">© 2024 Hunger Connect. Fighting hunger together.</p>
                </body>
                </html>
                """.formatted(name);
    }
}
