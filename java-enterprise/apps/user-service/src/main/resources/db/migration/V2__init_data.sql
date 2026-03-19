-- =====================================================
-- V2: Seed data - default admin user
-- Password: Admin@123456 (BCrypt hashed)
-- =====================================================

INSERT INTO `sys_user` (`id`, `username`, `password`, `nickname`, `email`, `status`, `roles`, `create_time`, `update_time`, `deleted`)
VALUES (1, 'admin', '$2a$12$LRVMbBFZqDMPJq6L3GVNVeNZrKFYPxHH4H/l3zT1v1HVH.9hR4Gje',
        'Administrator', 'admin@enterprise.com', 0, 'ADMIN,USER',
        NOW(), NOW(), 0);
