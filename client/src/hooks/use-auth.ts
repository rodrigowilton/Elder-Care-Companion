import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase"; // Importando o cliente que criamos
import { useLocation } from "wouter";

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // 1. Verifica se o usuário está logado no Supabase
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      // Busca dados extras (como is_blocked) na tabela profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return { ...user, ...profile };
    },
    retry: false,
  });

  // 2. Mutação de Login com Verificação de Bloqueio
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw new Error(error.message);

      // VERIFICAÇÃO DE BLOQUEIO
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_blocked')
        .eq('id', data.user.id)
        .single();

      if (profile?.is_blocked) {
        await supabase.auth.signOut();
        throw new Error("Sua conta está bloqueada pelo administrador.");
      }

      return { ...data.user, ...profile };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data);
      setLocation("/");
    },
  });

  // 3. Mutação de Cadastro (Register)
  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) throw new Error(error.message);
      return authData.user;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data);
      setLocation("/");
    },
  });

  // 4. Mutação de Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      setLocation("/auth");
    },
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
}