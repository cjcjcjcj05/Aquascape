import { useStore } from "@/store/editorStore";
import { AssetCategory } from "@/lib/types";
import { FaWater, FaMountain, FaLeaf, FaFish } from "react-icons/fa";

export default function CategoryNav() {
  const currentCategory = useStore(state => state.currentCategory);
  const setCurrentCategory = useStore(state => state.setCurrentCategory);
  
  const categories: { id: AssetCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'substrate', label: 'Substrate', icon: <FaWater className="mr-1.5" /> },
    { id: 'hardscape', label: 'Hardscape', icon: <FaMountain className="mr-1.5" /> },
    { id: 'plants', label: 'Plants', icon: <FaLeaf className="mr-1.5" /> },
    { id: 'fish', label: 'Fish', icon: <FaFish className="mr-1.5" /> },
  ];
  
  return (
    <div className="p-2 bg-gray-50 border-b border-gray-200">
      <div className="flex flex-wrap gap-1">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition ${
              currentCategory === category.id 
                ? 'bg-[#9BE36D] text-ui-dark' 
                : 'bg-white text-ui-dark hover:bg-gray-100'
            }`}
            onClick={() => setCurrentCategory(category.id)}
          >
            {category.icon} {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}
