package com.enterprise.common.core.util;

import com.enterprise.common.core.exception.BusinessException;
import com.enterprise.common.core.result.ResultCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Security context utilities for accessing current user info.
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    /**
     * Get current authenticated user ID from security context.
     */
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw BusinessException.of(ResultCode.UNAUTHORIZED);
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof Long userId) {
            return userId;
        }
        throw BusinessException.of(ResultCode.UNAUTHORIZED);
    }

    /**
     * Get current username.
     */
    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw BusinessException.of(ResultCode.UNAUTHORIZED);
        }
        return authentication.getName();
    }

    /**
     * Check if current user has a specific role.
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }
}
