package com.naqashly.monolith.auth.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.Map;
import java.util.HashMap;

/**
 * <h1>Email Service</h1>
 * 
 * <p><b>WHAT:</b> Sends asynchronous HTML verification emails using Resend HTTP API (primary/workaround for Render Free) or SMTP (fallback).</p>
 */
@Slf4j
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.resend.api-key:}")
    private String resendApiKey;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendVerificationEmail(String recipientEmail, String userName, String token) {
        String verifyUrl = baseUrl + "/api/v1/auth/verify-email?token=" + token;

        if (resendApiKey != null && !resendApiKey.trim().isEmpty()) {
            sendViaResend(recipientEmail, userName, verifyUrl);
        } else {
            sendViaSmtp(recipientEmail, userName, verifyUrl, token);
        }
    }

    private void sendViaResend(String recipientEmail, String userName, String verifyUrl) {
        log.info("Sending verification email to {} via Resend HTTP API...", recipientEmail);
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            
            // Note: Resend's free onboarding plan requires sending from 'onboarding@resend.dev' unless domain is verified
            String from = (fromEmail != null && !fromEmail.isEmpty() && fromEmail.contains("@")) 
                    ? fromEmail 
                    : "onboarding@resend.dev";
            
            requestBody.put("from", from);
            requestBody.put("to", Collections.singletonList(recipientEmail));
            requestBody.put("subject", "🌿 Activate Your Naqashly Workspace");
            
            String htmlContent = getEmailHtmlContent(userName, verifyUrl);
            requestBody.put("html", htmlContent);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity("https://api.resend.com/emails", entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Verification email successfully sent via Resend to {}", recipientEmail);
            } else {
                log.error("Failed to send email via Resend API. Response code: {}, Body: {}", response.getStatusCode(), response.getBody());
            }
        } catch (Exception e) {
            log.error("Error sending email via Resend HTTP API to {}: {}", recipientEmail, e.getMessage(), e);
            log.info("DEVELOPER FALLBACK - Click this link to verify manually: {}", verifyUrl);
        }
    }

    private void sendViaSmtp(String recipientEmail, String userName, String verifyUrl, String token) {
        log.info("Sending verification email to {} via SMTP MailSender...", recipientEmail);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail != null && !fromEmail.isEmpty() ? fromEmail : "noreply@naqashly.com");
            helper.setTo(recipientEmail);
            helper.setSubject("🌿 Activate Your Naqashly Workspace");

            String htmlContent = getEmailHtmlContent(userName, verifyUrl);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Verification email successfully sent via SMTP to {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email via SMTP to {}. Error: {}", recipientEmail, e.getMessage());
            log.info("DEVELOPER FALLBACK - Click this link to verify manually: {}", verifyUrl);
        }
    }

    private String getEmailHtmlContent(String userName, String verifyUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Activate Your Naqashly Workspace</title>
                <style>
                    body {
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        background-color: #0B0F19;
                        color: #F3F4F6;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 40px auto;
                        background-color: #111827;
                        border: 1px solid #1F2937;
                        border-radius: 16px;
                        padding: 40px;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .logo {
                        font-size: 24px;
                        font-weight: 800;
                        color: #10B981;
                        letter-spacing: -0.05em;
                    }
                    h1 {
                        font-size: 20px;
                        font-weight: 700;
                        color: #FFFFFF;
                        margin-top: 0;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    p {
                        font-size: 15px;
                        line-height: 1.6;
                        color: #9CA3AF;
                        margin-bottom: 30px;
                    }
                    .btn-container {
                        text-align: center;
                        margin-bottom: 35px;
                    }
                    .btn {
                        display: inline-block;
                        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                        color: #FFFFFF !important;
                        text-decoration: none;
                        padding: 12px 30px;
                        font-size: 15px;
                        font-weight: 600;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
                    }
                    .footer {
                        border-top: 1px solid #1F2937;
                        padding-top: 20px;
                        font-size: 12px;
                        color: #4B5563;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <span class="logo">🌿 Naqashly</span>
                    </div>
                    <h1>Confirm Your Email Address</h1>
                    <p>Salam {{userName}},</p>
                    <p>Thank you for signing up for Naqashly! Please click the button below to verify your email address and activate your unified daily workspace.</p>
                    <div class="btn-container">
                        <a href="{{verifyUrl}}" class="btn">Verify Email Address</a>
                    </div>
                    <p style="font-size: 13px; color: #4B5563; margin-bottom: 20px;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="{{verifyUrl}}" style="color: #38BDF8; text-decoration: underline;">{{verifyUrl}}</a>
                    </p>
                    <div class="footer">
                        Copyright &copy; 2026 Naqashly. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
            """
            .replace("{{userName}}", userName)
            .replace("{{verifyUrl}}", verifyUrl);
    }
}
