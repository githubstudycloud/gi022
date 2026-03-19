package com.enterprise.user.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.enterprise.common.core.domain.BaseEntity;
import lombok.Getter;
import lombok.Setter;

/**
 * User entity mapped to `sys_user` table.
 */
@Getter
@Setter
@TableName("sys_user")
public class User extends BaseEntity {

    private String username;
    private String password;
    private String nickname;
    private String email;
    private String phone;
    private String avatar;

    /** User status: 0=active, 1=disabled */
    private Integer status;

    /** Comma-separated roles, e.g. "ADMIN,USER" */
    private String roles;
}
