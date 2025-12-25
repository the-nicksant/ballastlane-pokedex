** Project Starter
We are going to create the implementation for a Pokedex App. All the project requirements are in a file inside the docs folder called project-requirements.md.
Read and understand the project requirements so we can start planning our implemenetation.

We wont be writing any code for now.

We are only going to use Next.js, leveraging the API Routes for simplicity.
The database will be a SQLite DB.
The base components will be implemented using Shadcn ui

We will be using a Feature-based folder structure, following Clean Architecture principles and making it extensible for future features.
The authentication will be handled by Next middleware using cookies for SSR.

after understanding the project requirements enter plan mode for us to prepare the steps of our implementation, starting by the setup of dependencies, styles and initial structures.

res: It hgave a 9 step plan for the implementation of the project, starting with the setup of the project, dependencies and styles.

==========
** Refining the implementation plan
Great, lets start the implementation following the phase 1.

We are going to separate the phases as checkpoints. After completing a checkpoint we are going to iterate over what was build and look out for implementation errors, improvements on architecture, code quality and creating automated
tests for the components.

The tests must focus on user journeys, testing the cases like a user would do.

So our development steps will be:
1. Plan the implementation details of the Phase
2. Implement the code
3. Iterate to verify bugs, vulnerabilities and improvements
4. Create automated tests to keep the user flows covered

lets start the implementation of the config in phase 1

==========
** reviewing the implementation og phase 1
Lets review this step before continuing.

You may change the middleware for proxy, according to next 16

The colors of the pokemon times must match with the figma design: https://www.figma.com/design/Rgo3WxffE0NLDtLAxvlHo3/Pok%C3%A9dex--Community---Copy-?node-id=916-913&m=dev
Ajust the configuration to match the design in figma

I also want you to create to extensibility props for Ui components like input and select. I want you add the possibility to have:
1. Variants (filled, outlined as default, invisbible)
2. Icons as prefix and suffix
3. Mask pattern in inputs

== missing phase 2 prompts

====
** Starting Phase 3

The Figma MCP server is configured.
We are now focusing on the phase 3 of our implementation plan: Pokemon List and Details.
Lets be focusing on our pokemon list right now.

lets continue planning the implementation of our Pokemon list based on the Figma Design:
https://www.figma.com/design/Rgo3WxffE0NLDtLAxvlHo3/Pok%C3%A9dex--Community---Copy-?node-id=1013-1576&m=dev

use figma MCP to get it.

the implementation of the pokemon list must have:
- Search option by name
- Sorting option (by name or number)
- Route state (using query params)
- Loading skeleton and Error fallbacks
- infinite scroll list
- Haptic feedback and smooth animations




very bad generated code:
`export function InfiniteScrollPokemonList({
  initialData,
  searchParams,
}: InfiniteScrollPokemonListProps) {
  const [pokemon, setPokemon] = useState<Pokemon[]>(initialData.pokemon);
  const [offset, setOffset] = useState(initialData.offset + initialData.limit);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useSearchParams();

  useEffect(() => {
    setPokemon(initialData.pokemon);
    setOffset(initialData.offset + initialData.limit);
    setHasMore(initialData.hasMore);
    setError(null);
  }, [params, initialData]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        offset: offset.toString(),
        limit: "20",
      });

      if (searchParams.search) {
        queryParams.set("search", searchParams.search);
      }
      if (searchParams.sortBy) {
        queryParams.set("sortBy", searchParams.sortBy);
      }
      if (searchParams.order) {
        queryParams.set("order", searchParams.order);
      }

      const response = await fetch(`/api/pokemon?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch Pokemon");
      }

      const data: { data: PokemonListResult } = await response.json();

      setPokemon((prev) => [...prev, ...data.data.pokemon]);
      setOffset((prev) => prev + data.data.limit);
      setHasMore(data.data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [offset, hasMore, isLoading, searchParams]);

  const { observerTarget } = useInfiniteScroll({
    onLoadMore: loadMore,
    isLoading,
    hasMore,
  });

  const handleRetry = useCallback(() => {
    setError(null);
    loadMore();
  }, [loadMore]);

  if (pokemon.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No Pokemon found.</p>
      </div>
    );
  }

  return (
    <div>
      <PokemonGrid pokemon={pokemon} />

      {hasMore && (
        <div ref={observerTarget} className="py-8 flex justify-center">
          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#DC0A2D] border-t-transparent" />
              <span className="text-sm text-muted-foreground">
                Loading more Pokemon...
              </span>
            </div>
          )}
        </div>
      )}

      {!hasMore && pokemon.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            You've seen all {initialData.total} Pokemon!
          </p>
        </div>
      )}

      {error && <PokemonListError message={error} onRetry={handleRetry} />}
    </div>
  );
}`


had to create a Server action to fetch pokemon data for encapsuling the code that exposes environment variables to the server side.


noticed that a infinite scroll list when rendered many items causes performance issues on mobile devices.To mitigate this, we can implement windowing using a library like react-window or react-virtualized

Prompt:
Turn the PokemonGrid into a virtual list for performance optmization using react-window.

The the virtual list component must have a callback for when the scroll reaches the end, so then we can call the "fetchNextPage" function.
It also must receive a "loadingNext" prop to show a loading indicator when the parent component is fetching the next page.
Show an empty indicator when no pokemons are available in the list.


found a problem with the search, we dont have a search param in the PokeAPI, so i implemented a search input using a community endpoint that fetches all pokemon names and filters them in memory.

Prompt for changing the implementation of the search:
`We will be changing our pokemon search implementation.

The current problem:
The PokeAPI doesnt have search capabilities for cost savings, so there is no good way of searching only using the pokemon list method. The currrent implementation lists some pokemons and make a local filter search, but this wont work
properly since we are limiting the list.

We will be creating a solution using a custom community published api: https://pokemon-service-ucql.onrender.com/api/v1/pokemon/search?name=pokemon-name.
When a search value is inserted in the search input we will show a list of the results in a dropdown. We wont be filtering the results directly on the pokemon list.
This dropdown list will have a link for the pokemon profile pages.

The response of the search endpoint is an array of objects:
{
        "name": "pikachu",
        "url": "https://pokeapi.co/api/v2/pokemon/25/"
    }

so you are able to get the name, url and id from the url to display the image of the pokemon in the dropdown list.
Make this work as an autocomplete, with accessibility and a great UX.`

code improvements and revalidation:
`lets revisit that implementation for code improvements and optmizations.

1. The pattern was broken, I want to access these external urls via my Next API Routes just like the other routes.
2. Implement a useDebouce customHook for optmizing this code
3. Use react query for caching requests and handling server state
4. keep the visual coherence by using the same sprite images that are being used in the pokemon cards`

=========

Refatoring data flow to use local pokemon data for searching and listing
prompt:
Great. Now we are going to make a massive refactoring in the way we use that Pokemon data.

the official pokeApi is quite limited in terms of params and options. Thats why we had to implement a thid-party api. But it didnt solve our problem, since we cannot make server-side ordering properly.

We will have to restructure this part of our application, initially making an http request to PokeApi an then loading all the pokemons inside our database. We dont have to save all information, just the most important such as name,
id, type, etc...
So the flow steps would be:
1. Fetching all the pokemons (making a reqeust to see the total and them getting all of em)
2. loading in our SQLIte database
3. The search and list will use our local pokemon data, achieveing sorting and removing third-party dependencies
4. Complete details of the pokemons (detail page) will still use PokeApi for fresh data.

Lets plan on how to implement this

==========
Some fixes in the migration flow

Ok, we have to make some updates in the seeding flow that is not working properly.

The migrations are only running with a command in the terminal, not when the app is started. The fs doesnt work properly when the application is being build and this is expected.

But the seeding logic only works if my application is up and running, because I need the env variables to be setup.
You have to move my seeding logic to the startup of the project. As soon as the app start running the data must be get from pokeapi and inserted into the database, with the env variables properly configured.



Small but relevant UI refinements prompt:
Before continuing I want to make 2 fixes in my list component.

1. When the list is rendered the first time in larger devices, it gets loaded with half the capacity of the screen, but as the list doesnt need scrolling (because all the content is inside the container) the 'fetchNextPage' function
is never being called. I want you to make a simple verification to always make sure we have our pokemon list all over the container making the infinite scroll work properly.

2. Some of the pokemons, specially the newer ones doesnt have a sprite, its not being found. I want you to display a default pokemon placeholder when the pokemon sprite is not found