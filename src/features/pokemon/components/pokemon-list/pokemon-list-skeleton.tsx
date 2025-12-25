export function PokemonListSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="h-[108px] w-full bg-gray-200 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}
