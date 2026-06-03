package com.noHunger.Hunger_Connect.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.jwt")
@Data
public class JwtProperties {
    private String secret;
    private long accessTokenExpiryMs = 900_000L;
    private long refreshTokenExpiryMs = 604_800_000L;
}
