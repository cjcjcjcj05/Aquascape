import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ColorSwatchProps {
  color: string;
  name: string;
  selected?: boolean;
  onClick?: () => void;
}

export function ColorSwatch({ color, name, selected = false, onClick }: ColorSwatchProps) {
  return (
    <div 
      className={cn(
        "group flex items-center h-14 border rounded-md cursor-pointer overflow-hidden",
        selected ? "ring-2 ring-primary ring-offset-2" : "hover:border-gray-400"
      )}
      onClick={onClick}
    >
      <div 
        className="w-14 h-full flex-shrink-0" 
        style={{ backgroundColor: color }}
      />
      <div className="flex justify-between items-center flex-1 px-3">
        <span className="text-sm font-medium truncate">{name}</span>
        {selected && <Check className="h-4 w-4 text-primary" />}
      </div>
    </div>
  );
}