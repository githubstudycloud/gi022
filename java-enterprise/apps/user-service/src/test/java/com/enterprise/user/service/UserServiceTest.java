package com.enterprise.user.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.enterprise.common.core.exception.BusinessException;
import com.enterprise.common.security.jwt.JwtTokenProvider;
import com.enterprise.user.convert.UserConvert;
import com.enterprise.user.domain.dto.RegisterRequest;
import com.enterprise.user.domain.entity.User;
import com.enterprise.user.domain.vo.UserVO;
import com.enterprise.user.mapper.UserMapper;
import com.enterprise.user.service.impl.UserServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Tests")
class UserServiceTest {

    @Mock
    private UserMapper userMapper;
    @Mock
    private UserConvert userConvert;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    @DisplayName("register - success when username not taken")
    void register_success() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setPassword("P@ssw0rd");
        request.setNickname("New User");
        request.setEmail("new@example.com");

        when(userMapper.exists(any(LambdaQueryWrapper.class))).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userMapper.insert(any())).thenReturn(1);

        UserVO expected = new UserVO();
        expected.setUsername("newuser");
        when(userConvert.toVO(any())).thenReturn(expected);

        UserVO result = userService.register(request);

        assertThat(result.getUsername()).isEqualTo("newuser");
        verify(userMapper).insert(any(User.class));
    }

    @Test
    @DisplayName("register - throws conflict when username already exists")
    void register_conflict() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("existing");
        request.setPassword("P@ssw0rd");
        request.setNickname("Existing");

        when(userMapper.exists(any(LambdaQueryWrapper.class))).thenReturn(true);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("getById - throws not found when user missing")
    void getById_notFound() {
        when(userMapper.selectById(999L)).thenReturn(null);

        assertThatThrownBy(() -> userService.getById(999L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not found");
    }
}
