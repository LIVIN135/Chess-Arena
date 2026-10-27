package com.chessarena.service;

import com.chessarena.dto.request.LoginRequest;
import com.chessarena.dto.request.RegisterRequest;
import com.chessarena.dto.response.AuthResponse;
import com.chessarena.dto.response.UserProfileResponse;
import com.chessarena.entity.User;
import com.chessarena.entity.UserRole;
import com.chessarena.repository.UserRepository;
import com.chessarena.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username '" + request.getUsername() + "' is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email '" + request.getEmail() + "' is already registered");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User user = new User(
                request.getUsername().trim(),
                request.getEmail().trim().toLowerCase(),
                hashedPassword,
                UserRole.ROLE_USER
        );

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        return new AuthResponse(token, toProfileResponse(savedUser));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsernameOrEmail().trim();

        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier.toLowerCase()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        if (!user.isActive()) {
            throw new IllegalStateException("Your account has been deactivated. Please contact support.");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, toProfileResponse(user));
    }

    public UserProfileResponse toProfileResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getAvatarUrl(),
                user.getCreatedAt(),
                user.getBio(),
                user.getRating(),
                user.getGamesPlayed(),
                user.getGamesWon(),
                user.getGamesLost(),
                user.getGamesDrawn()
        );
    }
}
