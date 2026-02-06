import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertMedication, type InsertAppointment } from "@shared/routes";

// --- Medications ---
export function useMedications() {
  return useQuery({
    queryKey: [api.medications.list.path],
    queryFn: async () => {
      const res = await fetch(api.medications.list.path);
      if (!res.ok) throw new Error("Falha ao carregar medicamentos");
      return api.medications.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertMedication) => {
      const res = await fetch(api.medications.create.path, {
        method: api.medications.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Falha ao criar medicamento");
      return api.medications.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.medications.list.path] }),
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.medications.delete.path, { id });
      const res = await fetch(url, { method: api.medications.delete.method });
      if (!res.ok) throw new Error("Falha ao deletar medicamento");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.medications.list.path] }),
  });
}

// --- Appointments ---
export function useAppointments() {
  return useQuery({
    queryKey: [api.appointments.list.path],
    queryFn: async () => {
      const res = await fetch(api.appointments.list.path);
      if (!res.ok) throw new Error("Falha ao carregar consultas");
      return api.appointments.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const res = await fetch(api.appointments.create.path, {
        method: api.appointments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Falha ao criar consulta");
      return api.appointments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.appointments.list.path] }),
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.appointments.delete.path, { id });
      const res = await fetch(url, { method: api.appointments.delete.method });
      if (!res.ok) throw new Error("Falha ao deletar consulta");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.appointments.list.path] }),
  });
}

// --- Panic Button ---
export function usePanic() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.panic.trigger.path, { method: api.panic.trigger.method });
      if (!res.ok) throw new Error("Falha ao acionar pânico");
      return api.panic.trigger.responses[201].parse(await res.json());
    },
  });
}

// --- Admin ---
export function useAdminUsers() {
  return useQuery({
    queryKey: [api.admin.users.path],
    queryFn: async () => {
      const res = await fetch(api.admin.users.path);
      if (!res.ok) throw new Error("Falha ao carregar usuários");
      return api.admin.users.responses[200].parse(await res.json());
    },
  });
}

export function useToggleBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isBlocked }: { id: number; isBlocked: boolean }) => {
      const url = buildUrl(api.admin.toggleBlock.path, { id });
      const res = await fetch(url, {
        method: api.admin.toggleBlock.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar status");
      return api.admin.toggleBlock.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.admin.users.path] }),
  });
}
