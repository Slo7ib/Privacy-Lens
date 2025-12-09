function SkeletonCard() {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="group mb-3 flex animate-pulse flex-col items-center justify-center gap-3"
        >
          <div className="h-12 w-12 rounded-full bg-gray-700" />
          <span className="mt-2 h-4 w-16 rounded bg-gray-700" />
        </div>
      ))}
    </>
  );
}
function SkeletonLine() {
  return (
    <div className="w-full">
      <h1 className="mb-0 text-left text-xl font-medium">Usage</h1>
      <p className="mt-3 h-5 w-3/4 animate-pulse rounded-xl bg-gray-700"></p>
      <h1 className="mt-2 mb-0 text-left text-xl font-medium">Sharing</h1>
      <p className="mt-3 h-5 w-3/4 animate-pulse rounded-xl bg-gray-700"></p>
    </div>
  );
}
export default SkeletonCard;
export { SkeletonLine };
