import { useAdminUsers, useToggleBlockUser } from "@/hooks/use-resources";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
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

  // Simple client-side protection (API also protects)
  if (user && user.role !== 'admin') {
    setLocation("/");
    return null;
  }

  if (isLoading) return <div className="p-8 text-center">Carregando painel administrativo...</div>;

  return (
    <div className="p-6 pb-24 max-w-6xl mx-auto">
      <Card className="shadow-lg border-2 border-border">
        <CardHeader className="bg-gray-50 border-b border-border rounded-t-xl">
          <CardTitle className="text-2xl font-display font-bold">Gerenciamento de Usuários</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Usuário</TableHead>
                  <TableHead>Nome Completo</TableHead>
                  <TableHead>Assinatura</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((u) => (
                  <TableRow key={u.id} className={u.isBlocked ? "bg-red-50" : ""}>
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell>{u.fullName}</TableCell>
                    <TableCell>
                      {new Date(u.subscriptionEndDate) > new Date() ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600">Ativa</Badge>
                      ) : (
                        <Badge variant="destructive">Expirada</Badge>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Até {format(new Date(u.subscriptionEndDate), "dd/MM/yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {u.isBlocked ? (
                        <span className="text-red-600 font-bold flex items-center gap-1">Bloqueado</span>
                      ) : (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">Liberado</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <label className="text-sm font-medium mr-2">
                          {u.isBlocked ? "Desbloquear" : "Bloquear"}
                        </label>
                        <Switch
                          checked={u.isBlocked}
                          onCheckedChange={(checked) => toggleBlock.mutate({ id: u.id, isBlocked: checked })}
                          disabled={toggleBlock.isPending || u.role === 'admin'}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
