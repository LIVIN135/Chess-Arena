# Chess Arena — Phase 02 Report

## 1. Phase Information

Phase: 02
Name: Authentication & User Persistence
Status: Complete
Completed Date: 2026-10-03

---

## 2. What Was Implemented

- User registration (`POST /api/auth/register`) with input validation and BCrypt password hashing.
- User login (`POST /api/auth/login`) issuing signed JWT access tokens with user claims.
- Current user profile endpoint (`GET /api/auth/me`) protected by Spring Security JWT filter.
- PostgreSQL 18 persistence mapping the `users` table via Spring Data JPA with UUID keys.
- Frontend authentication store (Zustand) with localStorage persistence and Axios token interceptors.
- Frontend login and registration pages in pure JavaScript/JSX.

---

## 3. Files Created

| File | Purpose |
|------|---------|
| `backend/src/main/java/com/chessarena/entity/User.java` | JPA entity mapped to PostgreSQL `users` table |
| `backend/src/main/java/com/chessarena/entity/UserRole.java` | Role enumeration (`ROLE_USER`, `ROLE_ADMIN`) |
| `backend/src/main/java/com/chessarena/repository/UserRepository.java` | Spring Data JPA repository for user lookup |
| `backend/src/main/java/com/chessarena/security/JwtService.java` | JWT token generation, parsing, and expiration check |
| `backend/src/main/java/com/chessarena/security/JwtAuthFilter.java` | Security filter extracting Bearer token from headers |
| `backend/src/main/java/com/chessarena/config/SecurityConfig.java` | Spring Security 6 filter chain, stateless session, and BCrypt bean |
| `backend/src/main/java/com/chessarena/dto/request/RegisterRequest.java` | Registration request payload with validation constraints |
| `backend/src/main/java/com/chessarena/dto/request/LoginRequest.java` | Login credentials request payload |
| `backend/src/main/java/com/chessarena/dto/response/AuthResponse.java` | Authentication response containing token and user profile |
| `backend/src/main/java/com/chessarena/dto/response/UserProfileResponse.java` | Public user profile data transfer object |
| `backend/src/main/java/com/chessarena/service/AuthService.java` | Business logic for registration, authentication, and token creation |
| `backend/src/main/java/com/chessarena/controller/AuthController.java` | REST endpoints for `/api/auth/register`, `/login`, `/me` |
| `frontend/src/services/authService.js` | API client service for auth requests |
| `frontend/src/store/useAuthStore.js` | Zustand state store managing user profile and JWT persistence |
| `frontend/src/pages/auth/LoginPage.jsx` | User login form component |
| `frontend/src/pages/auth/RegisterPage.jsx` | User registration form component |
| `.env` | Local environment variables including database credentials (gitignored) |

---

## 4. Files Modified

| File | What Changed |
|------|--------------|
| `backend/pom.xml` | Added Spring Data JPA, Spring Security, and JJWT 0.12.6 dependencies |
| `backend/src/main/resources/application.yml` | Configured PostgreSQL datasource URL, credentials, and Hibernate DDL |
| `backend/src/main/java/com/chessarena/exception/GlobalExceptionHandler.java` | Added handlers for BadCredentials, IllegalArgument, and Validation exceptions |
| `frontend/src/services/api.js` | Added Bearer token injection on outgoing requests and 401 handling |
| `frontend/src/components/layout/Navbar.jsx` | Added user avatar, username, and Sign Out button |
| `frontend/src/pages/LandingPage.jsx` | Added authenticated user session overview card |
| `frontend/src/App.jsx` | Added routing between Landing, Login, and Register views |

---

## 5. How to Run This Phase

### Backend

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm run dev
```

### Database

```text
PostgreSQL 18 running on port 5432 with database `chess_arena` and table `users`.
Credentials supplied via root `.env` file.
```

---

## 6. How to Verify

1. Start backend and frontend.
2. Open `http://localhost:5173/` in a browser.
3. Click "Sign Up" and register an account (`username`, `email`, `password`).
4. Verify registration succeeds and the user avatar appears in the top navigation bar.
5. Click "Sign Out".
6. Click "Sign In" and enter the credentials.
7. Verify that login succeeds and profile details load from `GET /api/auth/me`.
8. Check the PostgreSQL database via `psql` to verify the new user record in the `users` table.

---

## 7. Expected Result

```text
Expected:

Registration creates a record in the PostgreSQL `users` table.
Password is saved only as a BCrypt hash.
JWT token is returned and stored in localStorage.
Protected requests include `Authorization: Bearer <token>`.
Navbar displays username and role.
Sign Out clears stored token and returns to guest state.
```

---

## 8. Verification Checklist

* [x] Frontend starts
* [x] Backend starts
* [x] Database connection works
* [x] Main feature works
* [x] API works
* [x] No console errors
* [x] No backend errors
* [x] Build succeeds

---

## 9. Errors / Bugs Found

| Error/Bug | Cause | Fix | Status |
|-----------|-------|-----|--------|
| PostgreSQL password authentication failure | Default blank password rejected by SCRAM-SHA-256 | Configured provided password in `.env` and `application.yml` | Fixed |
| Database `chess_arena` did not exist | Fresh PostgreSQL instance | Executed `CREATE DATABASE chess_arena;` | Fixed |
| Initial 401 on manual `/api/auth/me` test | Token variable not preserved between separate shell commands | Ran test within single shell session | Fixed |

---

## 10. Known Issues

```text
No known issues.
```

---

## 11. Important Configuration

```text
Backend port: 8080
Frontend port: 5173
Database name: chess_arena
Database user: postgres
JWT Expiration: 24 hours (86400000 ms)
Password algorithm: BCrypt (strength 12)
```

---

## 12. Phase Result

✅ COMPLETE

Authentication, user database persistence, password hashing, and JWT authorization are verified and operational.
