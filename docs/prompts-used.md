# Prompt Engineering Timeline

A detailed timeline of the iterative development process, showcasing strategic prompt engineering techniques for building a production-ready Pokédex application with Claude Code.

---

## Prompt Engineering Principles Applied

Throughout this project, the following prompt engineering strategies were employed:

1. **Planning and Executing** - Extensive use of Claude Code 'plan mode'
2. **Iterative Refinement** - Breaking complex tasks into checkpoint-based phases
3. **Constraint-Driven Development** - Explicitly defining architectural boundaries and tech stack limitations
4. **Context Preservation** - Building on previous outputs through continuous iteration
5. **Problem-First Approach** - Identifying issues before proposing solutions
6. **User-Centric Testing** - Enforcing test strategies that mirror real user behavior

---

## Development Timeline

### Phase 0: Project Initialization

#### Prompt #1: Foundation & Planning
**Context:** Establishing project scope and architectural direction before any code is written.

**Prompt:**
```
We are going to create the implementation for a Pokedex App. All the project requirements
are in a file inside the docs folder called project-requirements.md.
Read and understand the project requirements so we can start planning our implementation.

We wont be writing any code for now.

We are only going to use Next.js, leveraging the API Routes for simplicity.
The database will be a SQLite DB.
The base components will be implemented using Shadcn ui

We will be using a Feature-based folder structure, following Clean Architecture principles
and making it extensible for future features.
The authentication will be handled by Next middleware using cookies for SSR.

After understanding the project requirements enter plan mode for us to prepare the steps
of our implementation, starting by the setup of dependencies, styles and initial structures.
```

**Output & Analysis:**
- Generated a comprehensive 9-phase implementation plan
- Clear separation between planning and execution prevents premature coding
- Architectural constraints (Next.js, SQLite, Shadcn) guide all subsequent decisions
- **Learning:** Upfront architectural constraints create guardrails for the AI

---

#### Prompt #2: Checkpoint-Based Development Strategy
**Context:** Preventing technical debt through structured iteration cycles.

**Prompt:**
```
Great, lets start the implementation following the phase 1.

We are going to separate the phases as checkpoints. After completing a checkpoint we are
going to iterate over what was built and look out for implementation errors, improvements
on architecture, code quality and creating automated tests for the components.

The tests must focus on user journeys, testing the cases like a user would do.

So our development steps will be:
1. Plan the implementation details of the Phase
2. Implement the code
3. Iterate to verify bugs, vulnerabilities and improvements
4. Create automated tests to keep the user flows covered

lets start the implementation of the config in phase 1
```

**Output & Analysis:**
- Established a disciplined development cycle: Plan → Implement → Review → Test
- Set expectations for test quality (user journeys, not implementation details)
- The initial configs of the framework and other tools were setup
- **Learning:** Defining iteration loops upfront prevents shortcuts and ensures quality

---

### Phase 1: Foundation & Configuration

#### Prompt #3: Design System Alignment
**Context:** Ensuring visual consistency with reference design while enhancing component flexibility.

**Prompt:**
```
Lets review this step before continuing.

You may change the middleware for proxy, according to next 16

The colors of the pokemon types must match with the figma design:
https://www.figma.com/design/Rgo3WxffE0NLDtLAxvlHo3/Pokédex--Community---Copy-?node-id=916-913&m=dev
Adjust the configuration to match the design in figma

I also want you to create extensibility props for UI components like input and select.
I want you to add the possibility to have:
1. Variants (filled, outlined as default, invisible)
2. Icons as prefix and suffix
3. Mask pattern in inputs
```

**Output & Analysis:**
- Updated middleware to Next.js 16 patterns
- Integrated Figma MCP for design token extraction
- Enhanced base components with variant system
- **Outcome:** Components became reusable with proper type-safe variants
- **Learning:** External design references (Figma) anchor AI to consistent visual language

---

### Phase 3: Pokemon List Implementation

#### Prompt #4: Feature Implementation with Design Integration
**Context:** Implementing complex UX features while maintaining design fidelity.

**Prompt:**
```
The Figma MCP server is configured.
We are now focusing on the phase 3 of our implementation plan: Pokemon List and Details.
Lets be focusing on our pokemon list right now.

lets continue planning the implementation of our Pokemon list based on the Figma Design:
https://www.figma.com/design/Rgo3WxffE0NLDtLAxvlHo3/Pokédex--Community---Copy-?node-id=1013-1576&m=dev

use figma MCP to get it.

the implementation of the pokemon list must have:
- Search option by name
- Sorting option (by name or number)
- Route state (using query params)
- Loading skeleton and Error fallbacks
- infinite scroll list
- Haptic feedback and smooth animations
```

**Output & Analysis:**
- Generated infinite scroll implementation with manual state management
- **Problem Identified:** Initial implementation used imperative state updates (useState, useEffect)
- Over 150 lines of manual fetch/state logic
- Missing performance optimizations for large lists

**Initial Code Issues:**
```typescript
// Anti-pattern: Manual state management for server data
const [pokemon, setPokemon] = useState<Pokemon[]>(initialData.pokemon);
const [offset, setOffset] = useState(initialData.offset + initialData.limit);
const [hasMore, setHasMore] = useState(initialData.hasMore);
const [isLoading, setIsLoading] = useState(false);

// Complex effect chains
useEffect(() => {
  setPokemon(initialData.pokemon);
  setOffset(initialData.offset + initialData.limit);
  setHasMore(initialData.hasMore);
}, [params, initialData]);
```

**Learning:** Feature-rich requirements need declarative data fetching patterns (React Query)

---

#### Prompt #5: Performance Optimization
**Context:** Addressing performance degradation on mobile devices with large lists.

**Prompt:**
```
Turn the PokemonGrid into a virtual list for performance optimization using react-window.

The virtual list component must have a callback for when the scroll reaches the end,
so then we can call the "fetchNextPage" function.
It also must receive a "loadingNext" prop to show a loading indicator when the parent
component is fetching the next page.
Show an empty indicator when no pokemons are available in the list.
```

**Output & Analysis:**
- Implemented windowing with react-window (renders only visible items)
- Reduced DOM nodes from 800+ to ~20 for full Pokemon list
- Maintained smooth scroll performance on mobile
- **Learning:** Performance constraints should be stated explicitly before implementation

---

#### Prompt #6: API Constraints & Architecture Pivot
**Context:** Adapting to PokeAPI limitations (no search capability) without compromising UX.

**Prompt:**
```
We will be changing our pokemon search implementation.

The current problem:
The PokeAPI doesn't have search capabilities for cost savings, so there is no good way
of searching only using the pokemon list method. The current implementation lists some
pokemons and makes a local filter search, but this won't work properly since we are
limiting the list.

We will be creating a solution using a custom community published api:
https://pokemon-service-ucql.onrender.com/api/v1/pokemon/search?name=pokemon-name.

When a search value is inserted in the search input we will show a list of the results
in a dropdown. We won't be filtering the results directly on the pokemon list.
This dropdown list will have a link for the pokemon profile pages.

The response of the search endpoint is an array of objects:
{
    "name": "pikachu",
    "url": "https://pokeapi.co/api/v2/pokemon/25/"
}

so you are able to get the name, url and id from the url to display the image of the
pokemon in the dropdown list.
Make this work as an autocomplete, with accessibility and a great UX.
```

**Output & Analysis:**
- Created autocomplete search component
- **Problem:** Direct fetch to external API (pattern violation)
- **Learning:** API limitations discovered during implementation require architecture pivots

---

#### Prompt #7: Pattern Enforcement & Code Quality
**Context:** Correcting pattern violations introduced in quick iteration.

**Prompt:**
```
lets revisit that implementation for code improvements and optimizations.

1. The pattern was broken, I want to access these external urls via my Next API Routes
   just like the other routes.
2. Implement a useDebounce custom hook for optimizing this code
3. Use react query for caching requests and handling server state
4. keep the visual coherence by using the same sprite images that are being used in
   the pokemon cards
```

**Output & Analysis:**
- Enforced API route abstraction pattern
- Added debouncing for search input (400ms delay)
- Integrated React Query for automatic caching
- **Learning:** Pattern violations should be caught and corrected through explicit review prompts

---

#### Prompt #8: Data Architecture Overhaul
**Context:** Eliminating third-party dependencies and enabling server-side capabilities.

**Prompt:**
```
Great. Now we are going to make a massive refactoring in the way we use that Pokemon data.

The official pokeApi is quite limited in terms of params and options. That's why we had
to implement a third-party api. But it didn't solve our problem, since we cannot make
server-side ordering properly.

We will have to restructure this part of our application, initially making an http request
to PokeApi and then loading all the pokemons inside our database. We don't have to save
all information, just the most important such as name, id, type, etc...

So the flow steps would be:
1. Fetching all the pokemons (making a request to see the total and then getting all of them)
2. Loading in our SQLite database
3. The search and list will use our local pokemon data, achieving sorting and removing
   third-party dependencies
4. Complete details of the pokemons (detail page) will still use PokeApi for fresh data.

Lets plan on how to implement this
```

**Output & Analysis:**
- Created migration-based seeding system
- Cached 1,000+ Pokemon in local SQLite
- Enabled server-side search, sorting, and pagination
- Removed dependency on unreliable third-party API
- **Learning:** Architectural changes should explain the "why" (API limitations) before the "how"

---

#### Prompt #9: Environment-Aware Execution
**Context:** Fixing build-time vs. runtime environment variable issues.

**Prompt:**
```
Ok, we have to make some updates in the seeding flow that is not working properly.

The migrations are only running with a command in the terminal, not when the app is started.
The fs doesn't work properly when the application is being built and this is expected.

But the seeding logic only works if my application is up and running, because I need the
env variables to be setup.
You have to move my seeding logic to the startup of the project. As soon as the app starts
running the data must be fetched from pokeapi and inserted into the database, with the env
variables properly configured.
```

**Output & Analysis:**
- Moved seeding from build-time to runtime (database connection initialization)
- Ensured environment variables available during seeding
- **Learning:** Distinguish build-time vs. runtime constraints explicitly

---

#### Prompt #10: Edge Case Handling
**Context:** Improving UX for edge cases discovered during manual testing.

**Prompt:**
```
Before continuing I want to make 2 fixes in my list component.

1. When the list is rendered the first time in larger devices, it gets loaded with half
   the capacity of the screen, but as the list doesn't need scrolling (because all the
   content is inside the container) the 'fetchNextPage' function is never being called.
   I want you to make a simple verification to always make sure we have our pokemon list
   all over the container making the infinite scroll work properly.

2. Some of the pokemons, specially the newer ones doesn't have a sprite, it's not being
   found. I want you to display a default pokemon placeholder when the pokemon sprite
   is not found
```

**Output & Analysis:**
- Added initial page size detection (fills viewport on first load)
- Implemented fallback UI for missing sprites (❓ placeholder)
- **Learning:** Concrete examples of edge cases produce targeted fixes

---

### Phase 4: Navigation Optimization

#### Prompt #11: Prefetching for Perceived Performance
**Context:** Reducing perceived latency through strategic prefetching.

**Prompt:**
```
lets implement a design update that will improve the smoothness of the pokemon detail
page transition.

When I'm in the detail page of a pokemon, I want to prefetch the next and the previous page.
Then in the image header carousel I want to have loaded the sprites of the next and the
previous pokemons too.

When the user clicks on the next arrow, the image header will slide to the next pokemon
and then push the route to the next page that is already prefetched.

This way we won't have to wait for the loading to be complete, making the navigation on
the details page much more fluid
```

**Output & Analysis:**
- Implemented router.prefetch() for adjacent routes
- Preloaded images using Next.js Image component
- **Problem:** Still showed loading states during route transitions (SSR limitation)
- **Learning:** Prefetching alone doesn't eliminate loading states with SSR

---

#### Prompt #12: SSR to CSR Conversion (Critical Architecture Decision)
**Context:** Achieving zero loading states by moving from SSR to CSR with React Query.

**Prompt:**
```
We are going to make a critical update on the details page. The way I'm handling the data
and the cached routes are not matching with my desire for this page.

Instead of creating a dynamic route (pokemon/23), we are going to have a single route,
receiving a query param 'id'.
We are going to handle the data fetching of the pokemon data on the client.

That way we can have a nice transition between pages without looking stiff with all the loading states.
Lets plan this implementation with these requirements:
1. It must be a single page, navigating through a query param
2. We must always have the adjacent pokemons data fetched, so the transition can be smoother
3. We must cache the queries using react query
4. The styles must have a smooth transition, specially the image carousel and the
   background color.
5. handle the query param state with nuqs
```

**Output & Analysis:**
- Converted `/pokemon/[id]` → `/pokemon?id=X`
- Implemented React Query with infinite staleTime for caching
- Used `nuqs` for type-safe query param state management
- Prefetched adjacent Pokemon (id-1, id+1) automatically
- **Result:** 700ms navigation → 0ms (instant with cached data)
- **Trade-off:** Lost SSR SEO (acceptable for authenticated app)
- **Learning:** Architecture changes should state desired outcome (smooth transitions) not just implementation details

---

### Testing Phase

#### Prompt #13: User-Centric Testing Philosophy
**Context:** Establishing testing principles that mirror real user behavior.

**Prompt:**
```
Ok, now lets come back for our testing. Lets revisit the authentication flow tests and
check if everything is working properly.

Make sure we follow the principle of creating user journeys automated tests.
Check the coverage of our login flow and implement the missing test cases.
```

**Follow-up Refinement:**
```
Forget about testing the api service like you are doing right now. We have to test the
user flows. Test the components being clicked and triggering our API Routes. There is
no need to create such internal apis testing suites. Lets focus only on what is
necessary for raising the testing coverage of our app.
```

**Output & Analysis:**
- Removed framework-internal tests (Next.js API route internals)
- Focused on component interactions (LoginForm, navigation)
- Used semantic queries (`getByLabelText`, `getByRole`)
- **Learning:** Testing philosophy must be explicitly enforced to prevent over-testing

---

#### Prompt #14: Testing Pokemon List Journeys
**Context:** Applying user-centric testing to complex features.

**Prompt:**
```
great, now lets create the automated tests for our protected routes, starting by the
pokemon list. the tests must cover the user journeys on:
- searching pokemons
- listing pokemons
- sorting by name and number
- clicking the pokemon card

remember to focus on user journeys, not on Next API Internals.
```

**Output & Analysis:**
- Created 10 E2E tests for Pokemon list
- Avoided testing React Query internals (useInfiniteQuery)
- Tested user-visible outcomes (search results, sort button clicks)
- **Learning:** Feature requirements translate directly to test scenarios

---

#### Prompt #15: Pokemon Detail Testing
**Context:** Final test coverage for navigation and visual feedback.

**Prompt:**
```
great, lets move on for our final tests: The Pokemon Details

use the same principles of the previous test suites, focusing on user journeys.
you most focus on:
- information display
- navigation
```

**Output & Analysis:**
- 20 tests covering viewing, navigation, visual feedback
- Tested carousel controls (previous/next buttons)
- Verified type-based theming (background colors)
- **Result:** 63 total tests, all passing
- **Learning:** Consistent testing principles across features ensure quality

---

## Key Takeaways: Prompt Engineering Strategies

### 1. Constraint-First Prompting
Define architectural boundaries upfront:
- "Only use Next.js API Routes" (prevents serverless complications)
- "SQLite database" (scopes infrastructure decisions)
- "Feature-based folder structure" (enforces organization)

### 2. Problem-Solution Sequencing
State the problem before requesting the solution:
- ❌ "Use React Query for infinite scroll"
- ✅ "Infinite scroll has 150 lines of manual state logic. Use React Query."

### 3. Iterative Refinement Loops
Build → Review → Refine cycles prevent technical debt:
1. Generate initial implementation
2. Identify pattern violations
3. Request corrections with specific constraints

### 4. Outcome-Oriented Requirements
Focus on user experience, not implementation:
- ❌ "Use prefetch and React Query"
- ✅ "Navigation should have zero loading states"

### 5. Test-Driven Prompting
Define testing philosophy explicitly:
- "Tests must focus on user journeys"
- "Test what users see, not framework internals"

---

## Architectural Evolution Summary

| Aspect | Initial Approach | Final Implementation | Reason for Change |
|--------|-----------------|---------------------|-------------------|
| **Pokemon List** | Manual useState + fetch | React Query useInfiniteQuery | Eliminate 150 lines of boilerplate |
| **Search** | Third-party API | Local SQLite cache | Enable server-side sorting |
| **Detail Page** | SSR dynamic routes | CSR with query params | Achieve 0ms navigation |
| **Data Source** | Direct PokeAPI calls | SQLite cache + fresh details | Reduce API dependency |
| **Testing** | Framework internals | User journey E2E | Mirror real user behavior |

---

## Lessons Learned

1. **API constraints drive architecture** - PokeAPI limitations led to local caching strategy
2. **UX requirements trump SEO** - CSR chosen over SSR for better navigation experience
3. **Explicit iteration prevents drift** - Checkpoint-based reviews catch pattern violations
4. **Testing philosophy must be enforced** - AI defaults to implementation testing without guidance
5. **Performance needs measurement** - "Smooth" is subjective; "0ms navigation" is measurable

---

