package com.enterprise.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.enterprise.user.domain.entity.User;
import org.apache.ibatis.annotations.Mapper;

/**
 * User mapper. Inherits standard CRUD from BaseMapper.
 * Add custom queries here or in UserMapper.xml.
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
}
