import React, { useMemo } from "react";
import { IconCircle } from "../IconCircle/IconCircle";
import { useDataCollection } from "../../hooks/useDataCollection";
import { SkeletonCard } from "../SkeletonCard/SkeletonCard";

interface DataCollectionIconsProps {
  section: string;
}

export const DataCollectionIcons = React.memo(function DataCollectionIcons({
  section,
}: DataCollectionIconsProps) {
  const { categories, loading } = useDataCollection();

  // Memoize filtered icons to avoid recalculation on every render
  const icons = useMemo(() => {
    return categories
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
      });
  }, [categories, section]);

  if (loading) {
    return <SkeletonCard />;
  }

  return <>{icons}</>;
});

