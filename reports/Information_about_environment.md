# Information About Environment — Chess Arena

This report provides comprehensive technical documentation regarding the system environment, installed runtimes, database setup, service ports, configuration parameters, and step-by-step instructions for running and troubleshooting the **Chess Arena** platform.

---

## 1. System & Runtime Environment Inspection

The project environment on the host machine has been verified with the following specifications:

| Component | Detected Specification / Path | Status |
|---|---|---|
| **Operating System** | Windows 11 (64-bit, AMD64) | Active |
| **Java JDK** | Java SE 21.0.6 LTS (`C:\Program Files\Java\jdk-21`) | ✅ Verified |
| **Build Tool (Java)** | Apache Maven 3.8.9 (`C:\Program Files\apache-maven-3.8.9`) | ✅ Verified |
| **Node.js** | Node.js v22.15.0 & npm 10.x | ✅ Verified |
| **Database Server** | PostgreSQL 18.x (`D:\PostGreSql`) | ✅ Installed (Service: `postgresql-x64-18`) |
| **Docker Engine** | Docker CLI not present in system PATH | Optional (Local native run supported) |

---

## 2. Architecture & Service Map

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│   Web (React 19 + Vite)        Mobile (Flutter Client)      │
│   http://localhost:5173        lib/main.dart                │
└──────────────┬──────────────────────────────┬───────────────┘
               │ HTTP REST / SockJS WS        │ HTTP REST / WS
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Backend Layer                         │
│           Spring Boot 3.4.x (Java 21) on Port 8080          │
│   - REST Endpoints (/api/...)                               │
│   - STOMP WebSocket Broker (/ws)                            │
│   - Spring Security + JJWT Auth Filter                      │
│   - In-memory Simple Caches (leaderboard, dailyPuzzle)      │
│   - Spring Boot Actuator Monitoring (/actuator)             │
└──────────────┬──────────────────────────────────────────────┘
               │ JDBC (HikariCP Pool max=20)
               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                         │
│         PostgreSQL 18 Service (Port 5432)                   │
│   - Database: chess_arena                                   │
│   - User: postgres                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Database Configuration & Service Management

### Configuration Values (`.env` / `application.yml`)
- **Host**: `localhost`
- **Port**: `5432`
- **Database Name**: `chess_arena`
- **Database User**: `postgres`
- **Database Password**: `livin@123`
- **Install Directory**: `D:\PostGreSql\`
- **Data Directory**: `D:\PostGreSql\data`
- **Windows Service Name**: `postgresql-x64-18`

### Managing the PostgreSQL Service

Because PostgreSQL runs as a Windows Service, it must be running before starting the backend.

#### Option A: Via PowerShell (Run as Administrator)
```powershell
# Start the service
Start-Service postgresql-x64-18

# Check status
Get-Service postgresql-x64-18

# Stop the service (when finished)
Stop-Service postgresql-x64-18
```

#### Option B: Via Windows Services Manager GUI
1. Press <kbd>Win</kbd> + <kbd>R</kbd>, type `services.msc`, and press **Enter**.
2. Scroll to **postgresql-x64-18 - PostgreSQL Server 18**.
3. Right-click and select **Start** (set Startup type to *Automatic* if desired).

#### Initial Database Verification
If the `chess_arena` database has not been created yet:
```powershell
& "D:\PostGreSql\bin\psql.exe" -U postgres -c "CREATE DATABASE chess_arena;"
```
*(Enter password `livin@123` when prompted).*

---

## 4. How to Run the Project (Step-by-Step)

### Prerequisites Check
Before launching, ensure:
1. PostgreSQL service `postgresql-x64-18` is running.
2. Port `8080` (backend) and `5173` (frontend) are available.

---

### Step 1: Start Backend (Spring Boot)

Open a terminal (PowerShell or Command Prompt):

```powershell
cd d:\Desktop_2\Chess(1)\backend
mvn spring-boot:run
```

#### Verification & URLs
- **Backend Base URL**: `http://localhost:8080`
- **Health Check Endpoint**: `http://localhost:8080/api/health`
- **Actuator Diagnostics**: `http://localhost:8080/actuator`
- **Prometheus Metrics**: `http://localhost:8080/actuator/prometheus`
- **WebSocket Endpoint**: `ws://localhost:8080/ws`

*Expected Health Check Output:*
```json
{
  "status": "UP",
  "app": "chess-arena-backend",
  "version": "1.0.0-phase12"
}
```

---

### Step 2: Start Frontend (React + Vite)

Open a **second** terminal window:

```powershell
cd d:\Desktop_2\Chess(1)\frontend
npm install
npm run dev
```

#### Verification & URLs
- **Web App URL**: `http://localhost:5173`
- The Vite development server automatically proxies requests starting with `/api` and `/ws` to `http://localhost:8080`.

---

### Step 3: Run Mobile Application (Optional)

If running the Flutter mobile application:

```powershell
cd d:\Desktop_2\Chess(1)\mobile
flutter pub get
flutter run
```

---

### Step 4: Run with Docker Compose (Alternative Method)

If Docker Desktop is installed and started on the host:

```powershell
# Deploy all services via script
.\deploy.ps1

# Or run directly via compose
docker compose up --build -d
```

---

## 5. Environment Variables Reference

Located in [.env](file:///d:/Desktop_2/Chess(1)/.env):

| Variable | Default Value | Description |
|---|---|---|
| `SERVER_PORT` | `8080` | Port for the Spring Boot application |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL listener port |
| `DB_NAME` | `chess_arena` | Database name |
| `DB_USER` | `postgres` | Database username |
| `DB_PASSWORD` | `livin@123` | Database password |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin for frontend |
| `JWT_SECRET` | *(base64 encoded 256-bit string)* | Cryptographic key for JWT tokens |
| `JWT_EXPIRATION_MS` | `86400000` | JWT expiration duration (24 hours) |

---

## 6. Common Issues & Troubleshooting

### 1. Backend Fails with `Connection to localhost:5432 refused`
- **Cause**: The PostgreSQL Windows service is stopped.
- **Fix**: Open Administrator PowerShell and run `Start-Service postgresql-x64-18`.

### 2. Backend Fails with `database "chess_arena" does not exist`
- **Cause**: PostgreSQL is running, but the database has not been initialized.
- **Fix**: Run:
  ```powershell
  & "D:\PostGreSql\bin\psql.exe" -U postgres -c "CREATE DATABASE chess_arena;"
  ```

### 3. Port 8080 Already in Use
- **Cause**: Another process or an orphaned Java process is occupying port 8080.
- **Fix**:
  ```powershell
  # Find PID using port 8080
  Get-NetTCPConnection -LocalPort 8080 | Select-Object OwningProcess
  # Terminate process if needed
  Stop-Process -Id <PID> -Force
  ```

### 4. WebSocket Fails to Connect from Frontend
- **Cause**: Backend is offline or Vite proxy configuration is misaligned.
- **Fix**: Verify backend health at `http://localhost:8080/api/health`, and ensure frontend `vite.config.js` proxy targets port `8080`.
