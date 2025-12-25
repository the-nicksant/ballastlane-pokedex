export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-400 to-white">
      <div className="relative pb-20">
        <header className="relative px-5 pt-5 pb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="h-6 w-6 bg-white/30 rounded-full animate-pulse" />
            <div className="h-6 w-24 bg-white/30 rounded animate-pulse" />
          </div>
          <div className="h-8 w-40 bg-white/30 rounded animate-pulse" />

          <div className="absolute left-0 right-0 top-32 flex justify-center">
            <div className="relative w-52 h-52 bg-white/20 rounded-full animate-pulse" />
          </div>
        </header>

        <div className="relative bg-white rounded-t-[32px] mt-32 px-6 pt-16">
          <div className="flex justify-center gap-2 mb-6">
            <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
          </div>

          <div className="mb-6">
            <div className="h-6 w-24 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="text-center">
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="text-center">
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="h-6 w-32 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                  <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
