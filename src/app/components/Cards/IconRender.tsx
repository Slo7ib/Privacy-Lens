import { IconCircle } from "./IconCircle";
import { useCollectedCategories } from "../../hooks/useCollectedCategories";
import SkeletonCard from "./SkeletonCard";

function IconsRender({ section }: { section: string }) {
  const { categories, loading } = useCollectedCategories();

  if (loading) {
    return <SkeletonCard />;
  }

  return (
    <>
      {categories
        .filter((e) => e.section === section && e.collected)
        .map((e) => {
          const Icon = e.icon;
          return (
            <IconCircle
              key={e.key}
              label={`Collects ${e.element}`}
              icon={<Icon size={24} color="#ffdd00" />}
            />
          );
        })}
    </>
  );
}

export default IconsRender;
