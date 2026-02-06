import { useAdminUsers, useToggleBlockUser } from "@/hooks/use-resources";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: users, isLoading } = useAdminUsers();
  const toggleBlock = useToggleBlockUser();

  // Proteção de rota robusta usando useEffect
  useEffect(() => {
    if (!isLoading && user && user.role !== 'admin') {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center animate-pulse">
          <p className="text-lg font-medium text-muted-foreground">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  // Evita renderizar conteúdo se não for admin
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="p-6 pb-24 max-w-6xl mx-auto">
      <Card className="shadow-lg border-2 border-border overflow-hidden">
        <CardHeader className="bg-muted/50 border-b border-border">
          <CardTitle className="text-2xl font-bold text-primary">Gerenciamento de Usuários</CardTitle>
          <p className="text-sm text-muted-foreground">Controle de acesso e assinaturas da plataforma</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[200px]">E-mail / Usuário</TableHead>
                  <TableHead>Nome Completo</TableHead>
                  <TableHead>Plano / Assinatura</TableHead>
                  <TableHead>Status de Acesso</TableHead>
                  <TableHead className="text-right">Bloquear Acesso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((u) => {
                  const isSubscriptionActive = new Date(u.subscriptionEndDate) > new Date();
                  
                  return (
                    <TableRow key={u.id} className={u.isBlocked ? "bg-destructive/5" : ""}>
                      {/* Ajustado para mostrar email ou username conforme o Supabase */}
                      <TableCell className="font-medium">
                        {u.email || u.username}
                        {u.role === 'admin' && <Badge variant="outline" className="ml-2">Admin</Badge>}
                      </TableCell>
                      
                      <TableCell>{u.fullName}</TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {isSubscriptionActive ? (
                            <Badge className="w-fit bg-emerald-500">Ativa</Badge>
                          ) : (
                            <Badge variant="destructive" className="w-fit">Expirada</Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            Expira em: {format(new Date(u.subscriptionEndDate), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {u.isBlocked ? (
                          <span className="text-destructive font-semibold text-sm flex items-center gap-1 italic">
                            ● Suspenso
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold text-sm flex items-center gap-1">
                            ● Ativo
                          </span>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-3">
                          <span className={`text-xs font-medium ${u.isBlocked ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {u.isBlocked ? "BLOQUEADO" : "LIBERADO"}
                          </span>
                          <Switch
                            checked={u.isBlocked}
                            onCheckedChange={(checked) => toggleBlock.mutate({ id: u.id, isBlocked: checked })}
                            disabled={toggleBlock.isPending || u.role === 'admin' || u.id === user.id}
                            className="data-[state=checked]:bg-destructive"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}