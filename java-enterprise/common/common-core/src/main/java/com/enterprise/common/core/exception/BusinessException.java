package com.enterprise.common.core.exception;

import com.enterprise.common.core.result.ResultCode;
import lombok.Getter;

/**
 * Business exception for expected, handled errors.
 * Throw this when business rules are violated.
 */
@Getter
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(ResultCode resultCode) {
        super(resultCode.getMessage());
        this.code = resultCode.getCode();
    }

    public BusinessException(ResultCode resultCode, String message) {
        super(message);
        this.code = resultCode.getCode();
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public static BusinessException of(ResultCode resultCode) {
        return new BusinessException(resultCode);
    }

    public static BusinessException notFound(String resource) {
        return new BusinessException(ResultCode.NOT_FOUND, resource + " not found");
    }

    public static BusinessException conflict(String message) {
        return new BusinessException(ResultCode.CONFLICT, message);
    }

    public static BusinessException forbidden(String message) {
        return new BusinessException(ResultCode.FORBIDDEN, message);
    }
}
