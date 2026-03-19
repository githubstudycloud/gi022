package com.enterprise.common.security.jwt;

import com.enterprise.common.core.exception.BusinessException;
import com.enterprise.common.core.result.ResultCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

/**
 * JWT token generation and validation.
 *
 * <p>Configuration (application.yml):
 * <pre>
 * jwt:
 *   secret: your-256-bit-secret-key-here
 *   access-token-expiry: 3600     # seconds
 *   refresh-token-expiry: 604800  # seconds
 * </pre>
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private static final String CLAIM_USER_ID = "uid";
    private static final String CLAIM_ROLES = "roles";

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-token-expiry:3600}")
    private long accessTokenExpirySeconds;

    @Value("${jwt.refresh-token-expiry:604800}")
    private long refreshTokenExpirySeconds;

    public String generateAccessToken(Long userId, String username, String roles) {
        return buildToken(userId, username, roles, accessTokenExpirySeconds * 1000);
    }

    public String generateRefreshToken(Long userId, String username) {
        return buildToken(userId, username, null, refreshTokenExpirySeconds * 1000);
    }

    private String buildToken(Long userId, String subject, String roles, long expiryMs) {
        Map<String, Object> claims = new java.util.HashMap<>();
        claims.put(CLAIM_USER_ID, userId);
        if (roles != null) {
            claims.put(CLAIM_ROLES, roles);
        }
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiryMs))
                .signWith(getSignKey())
                .compact();
    }

    public Claims parseToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSignKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw BusinessException.of(ResultCode.TOKEN_EXPIRED);
        } catch (MalformedJwtException | UnsupportedJwtException | SignatureException e) {
            throw BusinessException.of(ResultCode.TOKEN_INVALID);
        }
    }

    public Long getUserId(String token) {
        Claims claims = parseToken(token);
        return claims.get(CLAIM_USER_ID, Long.class);
    }

    public String getUsername(String token) {
        return parseToken(token).getSubject();
    }

    public String getRoles(String token) {
        return parseToken(token).get(CLAIM_ROLES, String.class);
    }

    public boolean isTokenValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (BusinessException e) {
            return false;
        }
    }

    private SecretKey getSignKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }
}
