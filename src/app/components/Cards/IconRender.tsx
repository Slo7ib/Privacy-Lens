import { IconCircle } from "./IconCircle";
// import { collectedCategories } from "../../../logic/classifyData";
import { useCollectedCategories } from "../../hooks/useCollectedCategories";
function IconsRender({ section }: { section: string }) {
  const categories = useCollectedCategories();
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
