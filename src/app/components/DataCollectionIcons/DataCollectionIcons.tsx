import { IconCircle } from "../IconCircle/IconCircle";
import { useDataCollection } from "../../hooks/useDataCollection";
import { SkeletonCard } from "../SkeletonCard/SkeletonCard";

interface DataCollectionIconsProps {
  section: string;
}

export function DataCollectionIcons({ section }: DataCollectionIconsProps) {
  const { categories, loading } = useDataCollection();

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

