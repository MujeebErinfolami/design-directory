import type { Designer } from "@/lib/data/designers";
import { DesignerCard } from "./DesignerCard";

interface DesignerGridProps {
  designers: Designer[];
}

export function DesignerGrid({ designers }: DesignerGridProps) {
  if (designers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-foreground">No designers found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {designers.map((d) => (
        <DesignerCard key={d.id} designer={d} />
      ))}
    </div>
  );
}
