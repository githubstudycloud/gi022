package com.enterprise.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.enterprise.common.core.exception.BusinessException;
import com.enterprise.common.core.result.PageResult;
import com.enterprise.common.core.result.ResultCode;
import com.enterprise.common.security.jwt.JwtTokenProvider;
import com.enterprise.user.convert.UserConvert;
import com.enterprise.user.domain.dto.LoginRequest;
import com.enterprise.user.domain.dto.RegisterRequest;
import com.enterprise.user.domain.dto.UpdateUserRequest;
import com.enterprise.user.domain.entity.User;
import com.enterprise.user.domain.vo.LoginVO;
import com.enterprise.user.domain.vo.UserVO;
import com.enterprise.user.mapper.UserMapper;
import com.enterprise.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final UserConvert userConvert;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public LoginVO login(LoginRequest request) {
        User user = userMapper.selectOne(Wrappers.<User>lambdaQuery()
                .eq(User::getUsername, request.getUsername()));
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw BusinessException.of(ResultCode.PASSWORD_ERROR);
        }
        if (user.getStatus() != null && user.getStatus() == 1) {
            throw BusinessException.of(ResultCode.ACCOUNT_DISABLED);
        }
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getUsername(), user.getRoles());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getUsername());
        log.info("User [{}] logged in successfully", user.getUsername());
        return new LoginVO(accessToken, refreshToken, "Bearer", 3600, userConvert.toVO(user));
    }

    @Override
    @Transactional
    public UserVO register(RegisterRequest request) {
        boolean exists = userMapper.exists(Wrappers.<User>lambdaQuery()
                .eq(User::getUsername, request.getUsername()));
        if (exists) {
            throw BusinessException.of(ResultCode.USER_ALREADY_EXISTS);
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname());
        user.setEmail(request.getEmail());
        user.setStatus(0);
        user.setRoles("USER");
        userMapper.insert(user);
        log.info("User [{}] registered successfully", user.getUsername());
        return userConvert.toVO(user);
    }

    @Override
    public UserVO getById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw BusinessException.notFound("User");
        }
        return userConvert.toVO(user);
    }

    @Override
    public UserVO getByUsername(String username) {
        User user = userMapper.selectOne(Wrappers.<User>lambdaQuery()
                .eq(User::getUsername, username));
        if (user == null) {
            throw BusinessException.notFound("User");
        }
        return userConvert.toVO(user);
    }

    @Override
    public PageResult<UserVO> listUsers(int page, int size, String keyword) {
        LambdaQueryWrapper<User> wrapper = Wrappers.<User>lambdaQuery()
                .like(StringUtils.hasText(keyword), User::getUsername, keyword)
                .or()
                .like(StringUtils.hasText(keyword), User::getNickname, keyword)
                .orderByDesc(User::getCreateTime);
        Page<User> pageResult = userMapper.selectPage(new Page<>(page, size), wrapper);
        return PageResult.of(
                userConvert.toVOList(pageResult.getRecords()),
                pageResult.getTotal(),
                page,
                size);
    }

    @Override
    @Transactional
    public UserVO updateUser(Long id, UpdateUserRequest request) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw BusinessException.notFound("User");
        }
        if (StringUtils.hasText(request.getNickname())) user.setNickname(request.getNickname());
        if (StringUtils.hasText(request.getEmail())) user.setEmail(request.getEmail());
        if (StringUtils.hasText(request.getPhone())) user.setPhone(request.getPhone());
        if (StringUtils.hasText(request.getAvatar())) user.setAvatar(request.getAvatar());
        userMapper.updateById(user);
        return userConvert.toVO(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (userMapper.selectById(id) == null) {
            throw BusinessException.notFound("User");
        }
        userMapper.deleteById(id);
        log.info("User [{}] deleted", id);
    }

    @Override
    @Transactional
    public void changePassword(Long id, String oldPassword, String newPassword) {
        User user = userMapper.selectById(id);
        if (user == null) throw BusinessException.notFound("User");
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw BusinessException.of(ResultCode.PASSWORD_ERROR);
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userMapper.updateById(user);
    }

    @Override
    @Transactional
    public void disableUser(Long id) {
        updateStatus(id, 1);
    }

    @Override
    @Transactional
    public void enableUser(Long id) {
        updateStatus(id, 0);
    }

    private void updateStatus(Long id, int status) {
        User user = userMapper.selectById(id);
        if (user == null) throw BusinessException.notFound("User");
        user.setStatus(status);
        userMapper.updateById(user);
    }
}
