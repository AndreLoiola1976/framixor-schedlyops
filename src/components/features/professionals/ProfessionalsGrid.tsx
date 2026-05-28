import { useProfessionals } from "@/hooks/useProfessionals";
import { ProfessionalCard } from "./ProfessionalCard";

export function ProfessionalsGrid() {
  const pros = useProfessionals();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {pros.map((p) => (
        <ProfessionalCard key={p.id} pro={p} />
      ))}
    </div>
  );
}
