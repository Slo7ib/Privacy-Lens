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
    <div className="h-24">
      <p className="ml-2.5 h-2/6 w-4/5 animate-pulse rounded-lg bg-gray-700"></p>
      <p className="mt-1.5 ml-2.5 h-2/6 w-2/5 animate-pulse rounded-lg bg-gray-700"></p>
    </div>
  );
}
export default SkeletonCard;
export { SkeletonLine };
