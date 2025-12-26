# Pokédex - Ballast Lane Challenge

A modern, high-performance Pokédex application built with Next.js 16, featuring seamless client-side navigation, authentication, and an exceptional user experience.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Tests](https://img.shields.io/badge/Tests-63%20passing-success)

> **📘 Development Journey:** See [Prompt Engineering Timeline](./docs/prompts-used.md) for a detailed chronicle of the iterative development process, showcasing strategic prompt engineering techniques used to build this production-ready application.

> **🤖 Generative AI Task :** See [Generative AI Task](./docs/generative-ai-task.md) to check my thinking process on prompt engineering for designing a complex Table Component.

---

## 🎯 Project Overview

This Pokédex application showcases a production-ready implementation of modern web development practices, emphasizing **client-side rendering for optimal user experience**, clean architecture principles, and comprehensive testing.

The project demonstrates how strategic architectural decisions can create a smooth, app-like experience while maintaining code quality, testability, and scalability.

---

## 📖 User Stories

The following user stories validate the implemented functionality and demonstrate the value delivered by this application.

### User Story #1: Secure Access to Pokédex
**As a** Pokémon enthusiast
**I want to** log in with my credentials
**So that** I can access my personal Pokédex and keep my collection private

**Acceptance Criteria:**
- [x] User can enter username and password in a login form
- [x] System validates credentials (admin/admin)
- [x] Invalid credentials show clear error messages
- [x] Form shows validation errors for empty fields
- [x] Successful login redirects to Pokemon list
- [x] Session persists across page refreshes
- [x] User remains logged in for 7 days
- [x] Already logged-in users are redirected to main page
- [x] Protected routes redirect to login when not authenticated

---

### User Story #2: Browse Pokemon Collection
**As a** user
**I want to** browse through all available Pokemon in a scrollable list
**So that** I can discover and explore the entire Pokemon universe

**Acceptance Criteria:**
- [x] Pokemon list displays on the home page after login
- [x] Each Pokemon card shows sprite image, name, and number
- [x] List loads more Pokemon automatically as I scroll (infinite scroll)
- [x] Only visible Pokemon are rendered for optimal performance (virtualization)
- [x] Loading indicator appears while fetching more Pokemon
- [x] Images have fallback placeholder when sprite is unavailable
- [x] List fills the viewport on initial load
- [x] Smooth scrolling experience on mobile and desktop

---

### User Story #3: Search for Specific Pokemon
**As a** user
**I want to** search for Pokemon by name
**So that** I can quickly find specific Pokemon without scrolling

**Acceptance Criteria:**
- [x] Search bar is prominently displayed at the top of the page
- [x] Search suggestions appear as I type (autocomplete)
- [x] Results show matching Pokemon with sprites
- [x] Search is debounced to avoid excessive requests
- [x] Clicking a result navigates to Pokemon detail page
- [x] Search input clears after navigation
- [x] "No results" message displays when no matches found
- [x] Search works for partial Pokemon names

---

### User Story #4: Sort Pokemon Collection
**As a** user
**I want to** sort Pokemon by name or number
**So that** I can organize my view based on my preference

**Acceptance Criteria:**
- [x] Sort button is accessible in the header
- [x] Dropdown shows sort options (by number, by name)
- [x] Current sort state is displayed (ascending/descending)
- [x] Clicking same option toggles sort order
- [x] Sort preference is saved in URL (shareable links)
- [x] List updates immediately after sort selection
- [x] Sort state persists across page refreshes

---

### User Story #5: View Detailed Pokemon Information
**As a** user
**I want to** click on a Pokemon card
**So that** I can view detailed information about that Pokemon

**Acceptance Criteria:**
- [x] Clicking a Pokemon card navigates to detail page
- [x] Detail page shows Pokemon artwork (high-resolution)
- [x] Pokemon name and number are displayed
- [x] Type badges show all Pokemon types with correct colors
- [x] Physical attributes displayed (weight, height)
- [x] Abilities are listed
- [x] Base stats are shown with visual bars
- [x] Stat bars animate on page load
- [x] Background color matches Pokemon's primary type
- [x] Page is responsive on all screen sizes

---

### User Story #6: Navigate Between Pokemon Seamlessly
**As a** user
**I want to** navigate to previous/next Pokemon from the detail page
**So that** I can explore Pokemon sequentially without returning to the list

**Acceptance Criteria:**
- [x] Previous/Next arrow buttons are visible
- [x] Clicking next arrow navigates to next Pokemon
- [x] Clicking previous arrow navigates to previous Pokemon
- [x] Navigation is instant with no loading states
- [x] Background color transitions smoothly
- [x] Image carousel slides before navigation
- [x] Adjacent Pokemon data is prefetched
- [x] First Pokemon hides previous button
- [x] Navigation buttons are disabled during transitions
- [x] Browser back/forward buttons work correctly


---

## ✨ Key Features

### User Experience First
- **Instant Navigation** - Zero loading states when browsing Pokemon details thanks to React Query prefetching
- **Smooth Transitions** - Carousel animations and background color transitions create a native app feel
- **Infinite Scroll** - Seamless Pokemon list browsing with virtualized rendering for performance
- **Real-time Search** - Instant Pokemon search with debouncing and autocomplete
- **Smart Sorting** - Sort Pokemon by number or name with URL state persistence

### Technical Excellence
- **Authentication System** - Secure JWT-based authentication with session management
- **Offline-Ready** - SQLite database with automatic migrations and data persistence
- **Responsive Design** - Mobile-first approach with adaptive layouts
- **Type Safety** - Full TypeScript coverage with strict mode enabled
- **Comprehensive Testing** - 63 tests covering integration and E2E user journeys

---

## 🏗️ Architecture & Design Decisions

### Clean Architecture

The project follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── core/               # Business logic (framework-agnostic)
│   ├── domain/        # Entities, repositories, types
│   └── use-cases/     # Application business rules
├── features/          # Feature modules (Pokemon, Auth)
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   └── services/      # Feature-specific services
└── infrastructure/    # External implementations
    ├── database/      # SQLite implementation
    └── http/          # PokeAPI client
```

**Benefits:**
- ✅ Business logic independent of UI framework
- ✅ Easy to test (domain logic has no React dependencies)
- ✅ Swappable infrastructure (database, API clients)
- ✅ Clear dependency flow (inner layers don't know about outer layers)

**Trade-offs:**
- ⚠️ More files and folders (but better organization at scale)
- ⚠️ Slight learning curve for new developers

---

### Client-Side Rendering Strategy

#### Pokemon Detail Page: CSR over SSR

**Decision:** The Pokemon detail page uses **Client-Side Rendering with React Query** instead of traditional SSR.

**Implementation:**
```
Route: /pokemon?id=25 (query parameter)
Strategy: Client-side data fetching with aggressive prefetching
```

**Why Client-Side?**

1. **Zero Loading States Between Pokemon**
   - React Query prefetches adjacent Pokemon (previous/next) in the background
   - Navigating between Pokemon is instant (data already in cache)
   - Users experience smooth transitions without loading spinners

2. **Smooth Carousel Animations**
   - Carousel slide animation completes before route updates
   - Background color transitions smoothly based on Pokemon type
   - No jarring page reloads interrupting the animation flow

3. **Better Perceived Performance**
   - Initial load: ~500ms (same as SSR)
   - Navigation between Pokemon: **0ms** (cached data)
   - Previous implementations with SSR: ~700ms per navigation

4. **App-Like Experience**
   - Single Page Application feel for detail browsing
   - URL state management with `nuqs` for browser back/forward
   - Preloaded images for instant display

**Trade-offs:**
- ❌ No SEO optimization for individual Pokemon pages (acceptable for authenticated app)
- ❌ Initial JavaScript bundle slightly larger
- ✅ Dramatically better UX for core user journey (browsing Pokemon)
- ✅ Reduced server load (data fetching happens client-side)

---

### Data Fetching & Caching

**React Query** powers all client-side data fetching with strategic caching:

```typescript
// Pokemon details cached indefinitely
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,      // Never considered stale
      gcTime: 1000 * 60 * 60,   // Keep in cache for 1 hour
    },
  },
});

// Prefetch adjacent Pokemon
usePrefetchAdjacentPokemon(currentId);
```

**Benefits:**
- Instant navigation between previously viewed Pokemon
- Automatic background refetching for data freshness
- Optimistic UI updates
- Request deduplication

**Trade-offs:**
- More client-side memory usage (negligible: ~1KB per Pokemon)
- Additional JavaScript for query management (~50KB gzipped)

---

### Database Strategy

**SQLite with Better-SQLite3** for local data persistence:

**Why SQLite?**
- ✅ Zero configuration (no separate database server)
- ✅ Automatic migrations on startup
- ✅ Perfect for prototype/demo applications
- ✅ Easy to reset and seed data

**Trade-offs:**
- ⚠️ Not suitable for multi-instance deployments (single file lock)
- ⚠️ Limited to file system storage
- ✅ Ideal for this use case (single-user demo application)

---

### Authentication Architecture

**JWT-based authentication with session management:**

```
Login Flow:
1. User submits credentials (bcrypt password hashing)
2. Server validates and creates session in SQLite
3. Server signs JWT with session ID
4. Cookie set with HttpOnly, Secure flags
5. Middleware validates JWT on protected routes
```

**Security Measures:**
- Password hashing with bcrypt (10 rounds)
- HttpOnly cookies (XSS protection)
- Secure flag in production (HTTPS only)
- Session expiration (7 days default)
- CSRF protection via SameSite cookies

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1** - React framework with App Router
- **React 19.2** - UI library with latest features
- **TypeScript 5** - Type safety and developer experience
- **Tailwind CSS 4** - Utility-first styling
- **React Query** - Server state management
- **nuqs** - Type-safe URL state management
- **React Hook Form + Zod** - Form validation

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **SQLite (better-sqlite3)** - Embedded database
- **bcryptjs** - Password hashing
- **jose** - JWT handling
- **ky** - HTTP client for PokeAPI

### Testing
- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM simulation

### Developer Experience
- **ESLint** - Code linting
- **TypeScript Strict Mode** - Maximum type safety
- **Hot Module Replacement** - Fast development iterations

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (LTS recommended)
- pnpm 8+ (or npm/yarn)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ballastlane-pokedex
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Initialize the database**
   ```bash
   pnpm db:init
   ```
   This creates the SQLite database with migrations and seeds the admin user.

4. **Start development server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Default Credentials
- **Username:** `admin`
- **Password:** `admin`

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm test` | Run all tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:ui` | Open Vitest UI |
| `pnpm test:coverage` | Generate coverage report |
| `pnpm db:init` | Initialize database with migrations |
| `pnpm db:reset` | Reset database to clean state |
| `pnpm lint` | Run ESLint |

---

## 🧪 Testing Strategy

### Test Coverage: 63 Passing Tests

The project follows a **user-centric testing philosophy**:

> "Test what users see and interact with, not implementation details."

#### Test Categories

**Integration Tests (23 tests)**
- Authentication use cases (login, logout, session verification)
- Database interactions with in-memory SQLite
- Business logic validation

**E2E Tests (40 tests)**
- User journeys from login to browsing Pokemon
- Component interactions (clicking, typing, navigation)
- Visual feedback and accessibility
- Error states and edge cases

#### Testing Principles Applied
1. ✅ Test user interactions, not React internals
2. ✅ Use semantic queries (`getByRole`, `getByLabelText`)
3. ✅ Verify user-visible outcomes
4. ✅ Mock external dependencies (API, navigation)
5. ❌ Avoid testing framework internals (React Query, Next.js routing)

**Example E2E Test:**
```typescript
it("should navigate to next Pokemon when user clicks next button", async () => {
  const user = userEvent.setup();

  render(<PokemonImageCarousel {...props} />);

  // User clicks next button
  const nextButton = screen.getByLabelText("Next Pokemon");
  await user.click(nextButton);

  // Navigation triggered after animation
  await waitFor(() => {
    expect(mockOnNavigate).toHaveBeenCalledWith(26);
  });
});
```

---

## 📂 Project Structure

```
ballastlane-pokedex/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes (login)
│   │   ├── (protected)/       # Protected routes (Pokemon)
│   │   └── api/               # API endpoints
│   ├── components/            # Shared UI components
│   │   └── ui/               # shadcn/ui components
│   ├── core/                  # Business logic layer
│   │   ├── domain/           # Entities & repositories
│   │   └── use-cases/        # Application logic
│   ├── features/              # Feature modules
│   │   ├── auth/             # Authentication feature
│   │   └── pokemon/          # Pokemon feature
│   ├── infrastructure/        # External implementations
│   │   ├── database/         # SQLite setup & repos
│   │   └── http/             # PokeAPI client
│   └── lib/                   # Utilities & helpers
├── tests/
│   ├── e2e/                   # End-to-end tests
│   └── integration/           # Integration tests
├── data/                      # SQLite database file
```

---

## 🎨 Design Decisions

### UI/UX Patterns

1. **Type-Based Theming**
   - Background colors dynamically change based on Pokemon primary type
   - Smooth CSS transitions for color changes
   - Consistent color palette from official Pokemon design system

2. **Infinite Scroll with Virtualization**
   - Only renders visible Pokemon cards (performance optimization)
   - Maintains scroll position during navigation
   - Seamless loading of additional Pokemon

3. **Mobile-First Design**
   - Touch-optimized carousel controls
   - Responsive breakpoints for all screen sizes
   - Haptic feedback on supported devices

---

## 🔄 Future Improvements

### Potential Enhancements
- [ ] **Progressive Web App (PWA)** - Add service worker for offline support
- [ ] **Advanced Search** - Filter by type, abilities, stats
- [ ] **Favorites System** - Save favorite Pokemons
- [ ] **Dark Mode** - Theme switching with system preference detection
- [ ] **Internationalization** - Multi-language support
- [ ] **CI/CD Pipeline** - Automated testing and deployment

### Scalability Considerations
- Migrate to PostgreSQL for production multi-instance deployments
- Implement server-side caching layer (Redis)
- Add CDN for static assets and images
- Set up monitoring and logging (Sentry, DataDog)
- Implement rate limiting on API endpoints

---

## 📊 Performance Metrics

### Core Web Vitals (Target)
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Bundle Size
- **First Load JS:** ~150KB (optimized with code splitting)
- **Route Chunk Size:** ~20-30KB per route
- **React Query Bundle:** ~50KB (gzipped)

### Performance Optimizations
- Image optimization with Next.js `<Image>` component
- Lazy loading for off-screen components
- React Query request deduplication
- Virtualized lists for large datasets
- Prefetching on link hover

---

## 🤝 Contributing

This is a challenge project for Ballast Lane. For questions or feedback, please reach out to the project maintainer.

---

## 📄 License

This project is created as part of a technical assessment for Ballast Lane.

---

## 🙏 Acknowledgments

- **PokeAPI** - The RESTful Pokemon API ([https://pokeapi.co](https://pokeapi.co))
- **Next.js Team** - For an excellent React framework
- **Vercel** - For deployment infrastructure
- **Pokemon Company** - For the original Pokemon designs and data

---

## 📬 Contact

For questions about this project or technical discussions, please contact:

**Nicolas** - [GitHub Profile]

---

**Built with ❤️ using Next.js, React, and TypeScript**
