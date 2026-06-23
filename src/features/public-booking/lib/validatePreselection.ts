import type { PublicService } from "../api/publicServices";
import type { PublicProfessional } from "../api/publicProfessionals";

export interface PreselectionInput {
  serviceId?: string;
  professionalId?: string;
  services: PublicService[];
  professionals: PublicProfessional[];
}

export interface PreselectionResult {
  serviceId: string;
  professionalId: string;
}

/**
 * Drops URL-provided ids that don't exist in the loaded public lists.
 * Service / professional compatibility is NOT checked here — the public RPCs
 * don't expose that relationship; incompatible pairs naturally produce no
 * available slots.
 */
export function validatePreselection(input: PreselectionInput): PreselectionResult {
  const svc = input.serviceId && input.services.some((s) => s.id === input.serviceId)
    ? input.serviceId
    : "";
  const pro = input.professionalId && input.professionals.some((p) => p.id === input.professionalId)
    ? input.professionalId
    : "";
  return { serviceId: svc, professionalId: pro };
}
