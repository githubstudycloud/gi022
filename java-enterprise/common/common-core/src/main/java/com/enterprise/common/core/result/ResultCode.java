package com.enterprise.common.core.result;

import lombok.Getter;

/**
 * Business result codes.
 * Convention: HTTP-like codes for HTTP layer, 4xxxx/5xxxx for business layer.
 */
@Getter
public enum ResultCode {

    // ===== 2xx Success =====
    SUCCESS(200, "Success"),
    CREATED(201, "Created"),
    NO_CONTENT(204, "No Content"),

    // ===== 4xx Client Errors =====
    BAD_REQUEST(400, "Bad Request"),
    UNAUTHORIZED(401, "Unauthorized"),
    FORBIDDEN(403, "Forbidden"),
    NOT_FOUND(404, "Not Found"),
    METHOD_NOT_ALLOWED(405, "Method Not Allowed"),
    CONFLICT(409, "Conflict"),
    UNPROCESSABLE_ENTITY(422, "Unprocessable Entity"),
    TOO_MANY_REQUESTS(429, "Too Many Requests"),

    // ===== 5xx Server Errors =====
    INTERNAL_SERVER_ERROR(500, "Internal Server Error"),
    SERVICE_UNAVAILABLE(503, "Service Unavailable"),

    // ===== 4xxxx Business Errors =====
    USER_NOT_FOUND(40401, "User not found"),
    USER_ALREADY_EXISTS(40901, "User already exists"),
    PASSWORD_ERROR(40101, "Username or password is incorrect"),
    TOKEN_EXPIRED(40102, "Token has expired"),
    TOKEN_INVALID(40103, "Token is invalid"),
    ACCOUNT_DISABLED(40301, "Account is disabled"),
    PARAM_VALIDATE_ERROR(42201, "Parameter validation failed");

    private final int code;
    private final String message;

    ResultCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
