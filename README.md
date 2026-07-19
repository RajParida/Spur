# Spur - Frictionless Social Scheduling

A web-based consumer social app that eliminates the anxiety of formal calendar invites by allowing users to casually signal their availability to a closed circle of friends.

## Core Value Proposition
- **Frictionless**: <2 taps to post a status
- **Spontaneous**: Real-time availability signals
- **Intimate**: Closed circle of max 20 friends
- **Ephemeral**: Time-limited statuses and auto-deleting chats

## Tech Stack

### Frontend
- Next.js 14+ (React framework with built-in routing)
- React 18+ (UI library)
- Tailwind CSS (mobile-first styling)
- Lucide React (icons)
- TypeScript (type safety)

### Backend
- Spring Boot 3.x (Java framework)
- Supabase (PostgreSQL + Real-time WebSockets + Auth)
- Firebase (alternative for real-time)

### Infrastructure
- AWS (Deployment: EC2, RDS, S3)
- Supabase (Database & Auth)
- Google Maps Places API (address autocomplete)

## Project Structure

```
spur/
├── frontend/                 # Next.js + React web app
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # Reusable components
│   │   ├── features/        # Feature modules
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API & Supabase clients
│   │   ├── types/           # TypeScript types
│   │   ├── styles/          # Global styles
│   │   └── utils/           # Helper utilities
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.ts
│
├── backend/                  # Spring Boot application
│   ├── src/
│   │   ├── main/java/com/spur/
│   │   │   ├── config/      # Spring configuration
│   │   │   ├── controller/  # REST endpoints
│   │   │   ├── service/     # Business logic
│   │   │   ├── entity/      # JPA entities
│   │   │   ├── repository/  # Data access
│   │   │   └── dto/         # Data transfer objects
│   │   └── resources/
│   │       └── application.yml
│   ├── pom.xml
│   └── Dockerfile
│
├── database/                 # Database schema & migrations
│   ├── schema.sql           # PostgreSQL schema
│   └── migrations/          # Versioned migrations
│
├── docs/                     # Architecture & API documentation
│   ├── HLD.md              # High-Level Design
│   ├── LLD.md              # Low-Level Design
│   ├── API.md              # API specifications
│   └── DATABASE.md         # Database schema docs
│
├── docker-compose.yml       # Local development stack
├── .github/
│   └── workflows/           # CI/CD pipelines
└── README.md
```

## Phase 1 MVP Features

1. **Authentication & Inner Circle**
   - Google OAuth login
   - Add Friend interface (max 20)
   - Friend management dashboard

2. **Status Dashboard**
   - Three toggle buttons: "Free Now," "Free Tonight," "Already Here"
   - Energy Level selector (Low/Chill, High/Active)
   - Auto-expiration (1 hr, 3 hrs, 12 hrs)

3. **Double-Blind Feed**
   - "Who's Free" feed (visible only if user has active status)
   - Real-time updates via WebSockets
   - Friend availability view

4. **Claim a Seat**
   - Post micro-event (What, Where, Spots)
   - Claim button with counter
   - Auto-disable when full

5. **Ephemeral Chat**
   - 1-on-1 real-time chat modal
   - Expiration indicator
   - Auto-delete on status expiry

## Getting Started

### Prerequisites
- Node.js 18+ (frontend)
- Java 17+ (backend)
- PostgreSQL 14+ (or Supabase account)
- Docker & Docker Compose (optional, for local setup)

### Development Setup

```bash
# Clone repository
git clone <repo-url>
cd spur

# Frontend setup
cd frontend
npm install
npm run dev

# Backend setup (in new terminal)
cd backend
mvn clean install
mvn spring-boot:run
```

### GitHub Setup

#### GitHub Pages Deployment
The frontend automatically deploys to GitHub Pages on every push to `main`:

1. Go to **Settings → Pages** in your GitHub repository
2. Set deployment source to **GitHub Actions**
3. The workflow `.github/workflows/deploy-pages.yml` handles everything
4. Visit `https://yourusername.github.io/spur` after first deployment

## Contributing

Follow the LLD/HLD principles outlined in `docs/LLD.md` and `docs/HLD.md`.

## License

MIT
