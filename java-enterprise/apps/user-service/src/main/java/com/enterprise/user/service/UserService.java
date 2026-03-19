package com.enterprise.user.service;

import com.enterprise.common.core.result.PageResult;
import com.enterprise.user.domain.dto.LoginRequest;
import com.enterprise.user.domain.dto.RegisterRequest;
import com.enterprise.user.domain.dto.UpdateUserRequest;
import com.enterprise.user.domain.vo.LoginVO;
import com.enterprise.user.domain.vo.UserVO;

public interface UserService {

    LoginVO login(LoginRequest request);

    UserVO register(RegisterRequest request);

    UserVO getById(Long id);

    UserVO getByUsername(String username);

    PageResult<UserVO> listUsers(int page, int size, String keyword);

    UserVO updateUser(Long id, UpdateUserRequest request);

    void deleteUser(Long id);

    void changePassword(Long id, String oldPassword, String newPassword);

    void disableUser(Long id);

    void enableUser(Long id);
}
