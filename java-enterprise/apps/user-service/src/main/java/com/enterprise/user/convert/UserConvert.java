package com.enterprise.user.convert;

import com.enterprise.user.domain.entity.User;
import com.enterprise.user.domain.vo.UserVO;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

/**
 * MapStruct converter between User entity and VOs.
 */
@Mapper(componentModel = "spring")
public interface UserConvert {

    UserVO toVO(User user);

    List<UserVO> toVOList(List<User> users);

    void updateEntity(User source, @MappingTarget User target);
}
