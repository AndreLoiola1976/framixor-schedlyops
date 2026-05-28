import { useServices } from "@/hooks/useServices";
import { ServiceCard } from "./ServiceCard";

export function ServicesGrid() {
  const services = useServices();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {services.map((s) => (
        <ServiceCard key={s.id} service={s} />
      ))}
    </div>
  );
}
