# Architecture Documentation

## Overview

This Pokedex application follows **Clean Architecture** principles with a **feature-based folder structure**, designed for scalability, maintainability, and testability.

## Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│              Presentation Layer                      │
│         (UI Components, Pages, Hooks)                │
│            src/app/, src/features/                   │
└─────────────────────────────────────────────────────┘
                         ▲
                         │
┌─────────────────────────────────────────────────────┐
│              Use Cases Layer                         │
│         (Business Logic, Application Rules)          │
│             src/core/use-cases/                      │
└─────────────────────────────────────────────────────┘
                         ▲
                         │
┌─────────────────────────────────────────────────────┐
│              Domain Layer                            │
│      (Entities, Repository Interfaces, VOs)          │
│             src/core/domain/                         │
└─────────────────────────────────────────────────────┘
                         ▲
                         │
┌─────────────────────────────────────────────────────┐
│            Infrastructure Layer                      │
│   (Database, HTTP Clients, External Services)        │
│           src/infrastructure/                        │
└─────────────────────────────────────────────────────┘
```

## Folder Structure

### Core Layer (`src/core/`)

**Purpose**: Framework-agnostic business logic and domain models

#### Domain (`src/core/domain/`)
- **entities/**: Pure domain objects (User, Pokemon, Ability, Move)
- **repositories/**: Repository interfaces (contracts for data access)
- **value-objects/**: Immutable value objects (Session)

**Key Principle**: No dependencies on frameworks or external libraries

#### Use Cases (`src/core/use-cases/`)
- **auth/**: Authentication business logic (login, logout, verify session)
- **pokemon/**: Pokemon-related operations (get list, get details, search)

**Key Principle**: Orchestrates data flow between domain and infrastructure

#### Config (`src/core/config/`)
- **constants.ts**: Application constants (routes, colors, pagination)
- **env.ts**: Type-safe environment variables with Zod validation

---

### Infrastructure Layer (`src/infrastructure/`)

**Purpose**: Implements repository interfaces and external service adapters

#### Database (`src/infrastructure/database/sqlite/`)
- **connection.ts**: Singleton database connection
- **migrations/**: SQL migration files and runner
- **repositories/**: Repository implementations
- **cleanup.ts**: Session cleanup utilities

**Pattern**: Repository Pattern with dependency injection

#### HTTP (`src/infrastructure/http/pokeapi/`)
- **client.ts**: HTTP client for PokeAPI
- **mappers/**: Transform API responses to domain entities
- **pokemon.repository.impl.ts**: Pokemon repository implementation

**Pattern**: Adapter Pattern (external API → domain entities)

#### Auth (`src/infrastructure/auth/`)
- **session.service.ts**: JWT creation and verification
- **password.service.ts**: Password hashing and comparison

---

### Features Layer (`src/features/`)

**Purpose**: Feature-specific presentation logic

#### Auth Feature (`src/features/auth/`)
- **components/**: Login form, login card
- **hooks/**: Custom hooks for auth logic
- **schemas/**: Zod validation schemas

#### Pokemon Feature (`src/features/pokemon/`)
- **components/pokemon-list/**: List view components
- **components/pokemon-detail/**: Detail view components
- **components/shared/**: Reusable Pokemon components
- **hooks/**: Pokemon-related hooks
- **types/**: Feature-specific types

**Pattern**: Feature-based organization with colocation

---

### App Layer (`src/app/`)

**Purpose**: Next.js App Router pages and API routes

#### Route Groups
- **(auth)/**: Public authentication pages
- **(protected)/**: Protected routes requiring authentication

#### API Routes
- **api/auth/**: Authentication endpoints
- **api/pokemon/**: Pokemon data endpoints

**Pattern**: Server Components first, Client Components when needed

---

### Components Layer (`src/components/`)

**Purpose**: Shared, reusable UI components

#### UI (`src/components/ui/`)
- Shadcn UI components (button, input, select, etc.)
- Extended with custom variants and features

#### Layout (`src/components/layout/`)
- Header, footer, container components

#### Providers (`src/components/providers/`)
- Context providers (toast, theme, etc.)

---

### Lib Layer (`src/lib/`)

**Purpose**: Shared utilities and helpers

- **utils.ts**: General utilities (cn, etc.)
- **api-response.ts**: Standardized API response helpers
- **error-handler.ts**: Centralized error handling
- **rate-limit.ts**: Rate limiting utilities
- **pokemon-utils.ts**: Pokemon-specific helpers

---

## Design Patterns

### 1. Repository Pattern

**Purpose**: Abstract data access logic

```typescript
// Domain - Interface
export interface UserRepository {
  findByUsername(username: string): User | null;
  validateCredentials(username: string, password: string): boolean;
}

// Infrastructure - Implementation
export class UserRepositoryImpl implements UserRepository {
  constructor(private db: Database) {}

  findByUsername(username: string): User | null {
    // SQLite implementation
  }
}
```

**Benefits**:
- Testable (mock repositories in tests)
- Swappable (change database without affecting business logic)
- Clear contracts

### 2. Dependency Injection

**Purpose**: Inversion of control

```typescript
// Use case receives dependencies
export class LoginUseCase {
  constructor(
    private userRepo: UserRepository,
    private sessionService: SessionService
  ) {}

  execute(username: string, password: string) {
    // Business logic
  }
}
```

**Benefits**:
- Loose coupling
- Easier testing
- Flexible configuration

### 3. Singleton Pattern

**Purpose**: Single database connection

```typescript
class DatabaseConnection {
  private static instance: Database | null = null;

  static getInstance(): Database {
    if (!this.instance) {
      this.instance = this.initialize();
    }
    return this.instance;
  }
}
```

**Benefits**:
- Resource efficiency
- Centralized configuration
- Connection pooling

### 4. Adapter Pattern

**Purpose**: Transform external data to domain models

```typescript
export class PokemonMapper {
  static toDomain(apiResponse: PokeAPIResponse): Pokemon {
    // Transform PokeAPI format → Domain entity
  }
}
```

**Benefits**:
- Isolates external API changes
- Clean domain models
- Single responsibility

### 5. Factory Pattern

**Purpose**: Create complex objects

```typescript
export const Errors = {
  NotFound: (resource: string) => new AppError(...),
  Unauthorized: (message: string) => new AppError(...),
};
```

**Benefits**:
- Consistent object creation
- Encapsulates creation logic

---

## Data Flow

### Authentication Flow

```
User Input (Login Form)
    ↓
API Route (/api/auth/login)
    ↓
Validation (Zod schema)
    ↓
Use Case (LoginUseCase)
    ↓
Repository (UserRepository)
    ↓
Database (SQLite)
    ↓
Session Service (JWT creation)
    ↓
Cookie (HTTP-only, secure)
    ↓
Response (Success/Error)
```

### Pokemon List Flow

```
Page Load (Server Component)
    ↓
API Route (/api/pokemon)
    ↓
Use Case (GetPokemonListUseCase)
    ↓
Repository (PokemonRepository)
    ↓
HTTP Client (PokeAPI)
    ↓
Mapper (API → Domain)
    ↓
Cache (Next.js fetch cache)
    ↓
Response (Pokemon list)
    ↓
Components (Render UI)
```

---

## Key Architectural Decisions

### 1. Clean Architecture

**Decision**: Separate domain, use cases, infrastructure, and presentation

**Rationale**:
- **Testability**: Test business logic without UI or database
- **Flexibility**: Swap PokeAPI for another source without changing use cases
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features

**Trade-offs**:
- More initial setup
- More files/folders
- Learning curve for new developers

### 2. Feature-Based Organization

**Decision**: Group by feature (auth, pokemon) instead of type (components, hooks)

**Rationale**:
- **Colocation**: Related code stays together
- **Team Scalability**: Different teams can own different features
- **Code Discovery**: Easier to find feature-specific code
- **Modularity**: Features are self-contained

**Trade-offs**:
- Potential code duplication (shared components needed)
- Harder to enforce global standards

### 3. Server Components First

**Decision**: Use React Server Components by default, Client Components when needed

**Rationale**:
- **Performance**: Less JavaScript sent to client
- **SEO**: Fully rendered HTML
- **Data Fetching**: Simplified server-side data access
- **Security**: Sensitive logic stays on server

**Trade-offs**:
- Cannot use client-side hooks (useState, useEffect) in Server Components
- Different mental model

### 4. SQLite for Sessions

**Decision**: Use SQLite instead of Redis or in-memory store

**Rationale**:
- **Simplicity**: No external dependencies
- **Persistence**: Survives server restarts
- **Sufficient**: Handles expected scale
- **Cost**: No additional infrastructure costs

**Trade-offs**:
- Not ideal for high concurrency (consider PostgreSQL at scale)
- Single point of failure (no replication)

### 5. PokeAPI Direct (No Local Cache)

**Decision**: Always fetch from PokeAPI, rely on Next.js cache

**Rationale**:
- **Freshness**: Always up-to-date data
- **Simplicity**: No sync complexity
- **Storage**: Smaller application size
- **Cache**: Next.js fetch cache handles performance

**Trade-offs**:
- Dependency on external API
- Network latency
- Potential rate limiting

### 6. TypeScript Strict Mode

**Decision**: Enable strict TypeScript with Zod for runtime validation

**Rationale**:
- **Type Safety**: Catch errors at compile time
- **Runtime Safety**: Zod validates external data
- **Developer Experience**: Better IDE support
- **Documentation**: Types serve as documentation

**Trade-offs**:
- More verbose code
- Learning curve

---

## Testing Strategy

### Unit Tests
- **Use Cases**: Test business logic in isolation
- **Mappers**: Test data transformations
- **Utilities**: Test helper functions

**Tools**: Vitest, Jest

### Integration Tests
- **API Routes**: Test endpoints with mocked dependencies
- **Repositories**: Test database operations

**Tools**: Supertest, Vitest

### E2E Tests
- **User Journeys**: Login, search, view details
- **Critical Flows**: Authentication flow

**Tools**: Playwright, Cypress

---

## Performance Considerations

### 1. Caching Strategy

```typescript
// Next.js fetch cache
fetch(url, {
  next: { revalidate: 3600 } // 1 hour
})
```

**Layers**:
- Browser cache
- Next.js fetch cache
- Database query results (prepared statements)

### 2. Database Optimization

- **WAL Mode**: Better concurrency
- **Indexes**: On username, session expiry, user_id
- **Prepared Statements**: better-sqlite3 compiles queries once

### 3. Image Optimization

- **next/image**: Automatic optimization
- **Remote Patterns**: Whitelisted domains
- **Lazy Loading**: Below-the-fold images

### 4. Code Splitting

- **Route-Based**: Automatic with Next.js App Router
- **Component-Based**: Dynamic imports for large components
- **Server Components**: Zero client-side JS for static content

---

## Scalability Considerations

### Current Limitations (MVP)

1. **In-Memory Rate Limiting**: Won't scale across servers
   - **Solution**: Redis for distributed rate limiting

2. **SQLite Database**: Single-threaded writes
   - **Solution**: PostgreSQL for high concurrency

3. **No CDN**: Images served from PokeAPI
   - **Solution**: CDN for Pokemon sprites/artwork

4. **No Horizontal Scaling**: Stateful sessions in local DB
   - **Solution**: Database replication or external session store

### Future Enhancements

1. **Caching Layer**: Redis for hot data
2. **Search**: Elasticsearch for advanced search
3. **Real-time**: WebSockets for live updates
4. **Background Jobs**: Queue system for async tasks
5. **Monitoring**: Application performance monitoring
6. **Logging**: Structured logging with correlation IDs

---

## Deployment Architecture

### Development
```
Local Machine
├── Next.js Dev Server (Port 3000)
├── SQLite Database (./data/database.sqlite)
└── Environment Variables (.env.local)
```

### Production (Recommended)
```
Cloud Provider (Vercel, AWS, etc.)
├── Next.js Application (Edge/Node.js runtime)
├── Database (PostgreSQL, PlanetScale, etc.)
├── File Storage (S3 for user uploads if needed)
├── CDN (Cloudflare, CloudFront)
└── Environment Variables (Platform secrets)
```

---

## Code Quality Standards

### TypeScript
- Strict mode enabled
- No implicit `any`
- Explicit return types for exported functions

### Code Organization
- Max 300 lines per file (consider splitting)
- Single Responsibility Principle
- DRY (Don't Repeat Yourself) for business logic

### Naming Conventions
- **Files**: kebab-case (user-repository.ts)
- **Components**: PascalCase (LoginForm.tsx)
- **Functions**: camelCase (getUserById)
- **Constants**: UPPER_SNAKE_CASE (AUTH_COOKIE_NAME)

### Documentation
- JSDoc for public APIs
- README for complex modules
- Inline comments for non-obvious logic

---

## Migration Path

### Phase 1: MVP (Current)
- Authentication
- Pokemon list with search/sort
- Pokemon detail view

### Phase 2: Enhanced Features
- User profiles
- Favorites/collections
- Advanced filtering

### Phase 3: Social Features
- Share collections
- Comments/reviews
- Team building

### Phase 4: Gamification
- Achievements
- Leaderboards
- Challenges

Each phase maintains Clean Architecture principles, ensuring smooth evolution.

---

## Conclusion

This architecture prioritizes:
1. **Maintainability**: Clear separation of concerns
2. **Testability**: Isolated, mockable components
3. **Scalability**: Feature-based organization
4. **Performance**: Caching and optimization
5. **Security**: Defense in depth

The architecture balances pragmatism (SQLite, PokeAPI direct) with best practices (Clean Architecture, TypeScript strict mode), providing a solid foundation for growth.

---

**Last Updated**: 2025-12-24
**Version**: 1.0
**Author**: Development Team
