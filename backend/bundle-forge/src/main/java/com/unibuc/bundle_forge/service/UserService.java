package com.unibuc.bundle_forge.service;

import com.unibuc.bundle_forge.dto.UserDto;
import com.unibuc.bundle_forge.exception.NotFoundException;
import com.unibuc.bundle_forge.exception.ValidationException;
import com.unibuc.bundle_forge.mapper.UserMapper;
import com.unibuc.bundle_forge.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public abstract class UserService<U extends User, D extends UserDto> {

    @Autowired
    private JwtService jwtService;

    protected abstract JpaRepository<U, Integer> getRepository();

    protected abstract String getEntityName();

    protected abstract UserMapper<U, D> getMapper();

    public final List<U> getAllUsers() {
        return getRepository().findAll();
    }

    public final U getUserById(Integer id) {
        Optional<U> user = getRepository().findById(id);
        if (user.isEmpty()) {
            throw new NotFoundException(String.format("No %s found at id %d", getEntityName(), id));
        }

        return user.get();
    }

    @SuppressWarnings(value = "unchecked")
    public final U getCurrentUser() {
        return (U) jwtService.getCurrentUser();
    }

    public U updateLoggedUser(D userDto) {
        U currentUser = getCurrentUser();

        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            if (userDto.getCurrentPassword() == null || userDto.getCurrentPassword().isEmpty()) {
                throw new ValidationException("Current password is required to change password");
            }

            if (!JwtService.isPasswordValid(userDto.getCurrentPassword(), currentUser.getPassword())) {
                throw new ValidationException("Current password is incorrect");
            }

            if (userDto.getCurrentPassword().equals(userDto.getPassword())) {
                throw new ValidationException("New password must be different from current password");
            }

            userDto.setPassword(JwtService.encryptPassword(userDto.getPassword()));
        }

        getMapper().updateEntityFromDto(userDto, currentUser);
        return getRepository().save(currentUser);
    }

}
