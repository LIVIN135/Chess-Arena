# Chess Arena

A full-stack, real-time online chess and learning platform.

## Technology Stack
- **Frontend**: React 19 + JavaScript (JSX) + Vite + Tailwind CSS + Zustand + Axios + chess.js + react-chessboard
- **Backend**: Java 21 + Spring Boot 3.4.x + Spring Security + JJWT + Spring Data JPA + Maven
- **Database**: PostgreSQL 18.4 (Local Service)

## Phase Status

| Phase | Name | Status | Report |
|---|---|---|---|
| **Phase 0** | Environment Inspection | ✅ Complete | [Environment Report](file:///d:/Desktop_2/Chess(1)/reports/Information_about_environment.md) |
| **Phase 1** | Architecture + Scaffold | ✅ Complete | [Phase 1 Report](file:///d:/Desktop_2/Chess(1)/reports/phase-01-report.md) |
| **Phase 2** | Authentication & User Persistence | ✅ Complete | [Phase 2 Report](file:///d:/Desktop_2/Chess(1)/reports/phase-02-report.md) |
| **Phase 3** | Chess Core Engine & Board | ✅ Complete | [Phase 3 Report](file:///d:/Desktop_2/Chess(1)/reports/phase-03-report.md) |
| **Phase 4** | Game Persistence | ✅ Complete | [Phase 4 Report](file:///d:/Desktop_2/Chess(1)/reports/phase-04-report.md) |
| **Phase 5** | Online Multiplayer | ✅ Complete | [Phase 5 Report](file:///d:/Desktop_2/Chess(1)/reports/phase-05-report.md) |
| **Phase 6** | AI Opponent | ✅ Complete | [Phase 6 Report](file:///d:/Desktop_2/Chess(1)/reports/phase-06-report.md) |
| **Phase 7** | Game Analysis | ✅ Complete | [Phase 7 Report](file:///d:/Desktop_2/Chess(1)/reports/phase-07-report.md) |
| **Phase 8** | Social Features | ✅ Complete | [Phase 8 Report](file:///d:/Desktop_2/Chess(1)/reports/phase-08-report.md) |
| **Phase 9** | Puzzles | ✅ Complete | [Phase 9 Report](file:///d:/Desktop_2/Chess(1)/reports/phase-09-report.md) |
| **Phase 10** | Tournaments | ✅ Complete | [Phase 10 Report](file:///d:/Desktop_2/Chess(1)/reports/phase-10-report.md) |
| **Phase 11** | Docker + Deployment | ✅ Complete | [Phase 11 Report](file:///d:/Desktop_2/Chess(1)/reports/phase-11-report.md) |
| **Phase 12** | Performance + Monitoring | ✅ Complete | [Phase 12 Report](file:///d:/Desktop_2/Chess(1)/reports/phase-12-report.md) |
| **Phase 13** | Flutter Mobile | ✅ Complete | [Phase 13 Report](file:///d:/Desktop_2/Chess(1)/reports/phase-13-report.md) |

---

## Project Structure
```
chess-arena/
├── frontend/          # React + Vite JavaScript/JSX client
├── backend/           # Spring Boot REST application
├── mobile/            # Flutter cross-platform mobile client
├── reports/           # Phase completion reports
├── .env.example       # Template environment variables
└── README.md
```

## Running the Development Environment

### Prerequisites
- Java 21 (JDK) & Apache Maven 3.8+
- Node.js 22.x & npm 10.x
- PostgreSQL 18.4 (running locally on port 5432, database `chess_arena`)

### 1. Start Backend
```bash
cd backend
mvn spring-boot:run
```
The backend API runs at `http://localhost:8080`.
Verify health: `http://localhost:8080/api/health`

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend application runs at `http://localhost:5173`.
"# Chess-Arena" 
