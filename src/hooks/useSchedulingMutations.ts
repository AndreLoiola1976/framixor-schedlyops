import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dataSource } from "@/lib/data-source";
import { qk } from "@/lib/query-keys";
import { toUserMessage } from "@/lib/scheduling-errors";
import {
  operatorCancelBooking,
  operatorCompleteBooking,
  operatorMarkNoShow,
  operatorRescheduleBooking,
  operatorUpdateBooking,
} from "@/lib/booking-public";
import type {
  ProfessionalCreateInput,
  ProfessionalUpdateInput,
  ServiceCreateInput,
  ServiceUpdateInput,
  WorkingHoursUpsertInput,
} from "@/lib/data-source/types";

function onError(err: unknown) {
  toast.error(toUserMessage(err));
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ServiceCreateInput) => dataSource.createService(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.services });
      toast.success("Service created");
    },
    onError,
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ServiceUpdateInput) => dataSource.updateService(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.services });
      toast.success("Service updated");
    },
    onError,
  });
}

export function useDisableService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dataSource.disableService(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.services });
      toast.success("Service disabled");
    },
    onError,
  });
}

export function useCreateProfessional() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfessionalCreateInput) => dataSource.createProfessional(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.professionals });
      toast.success("Professional created");
    },
    onError,
  });
}

export function useUpdateProfessional() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfessionalUpdateInput) => dataSource.updateProfessional(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.professionals });
      toast.success("Professional updated");
    },
    onError,
  });
}

export function useDisableProfessional() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dataSource.disableProfessional(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.professionals });
      toast.success("Professional disabled");
    },
    onError,
  });
}

export function useUpsertWorkingHours() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkingHoursUpsertInput) => dataSource.upsertWorkingHours(input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: qk.workingHours(variables.professionalId) });
      qc.invalidateQueries({ queryKey: qk.workingHours() });
      toast.success("Working hours saved");
    },
    onError,
  });
}
