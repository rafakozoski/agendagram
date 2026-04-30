import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Loader2, Users, UserPlus, Shield, ShieldPlus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const PLANS = [
  { value: "none", label: "Sem plano", priceId: "" },
  { value: "basic", label: "Básico (R$ 29,90/mês)", priceId: "price_1T7Pe5JwkjwrgXgTJQBG5DKM" },
  { value: "pro", label: "Pro (R$ 49,90/mês)", priceId: "price_1T7PecJwkjwrgXgTB9n8JMTb" },
];

export function UsersTab() {
  const queryClient = useQueryClient();
  const [showNewUser, setShowNewUser] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [userForm, setUserForm] = useState({ email: "", password: "", role: "owner" as AppRole, plan: "none" });
  const [roleForm, setRoleForm] = useState({ email: "", role: "admin" as AppRole });
  const [creating, setCreating] = useState(false);
  const [addingRole, setAddingRole] = useState(false);
  const [roleLookup, setRoleLookup] = useState<{ id: string; email: string } | null>(null);
  const [roleLookupError, setRoleLookupError] = useState("");

  const { data: userRoles = [], isLoading } = useQuery({
    queryKey: ["all-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const deleteUserRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
      toast.success("Role removida");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const lookupUser = async (email: string) => {
    if (!email.trim()) return;
    setRoleLookupError("");
    setRoleLookup(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lookup-user-by-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao buscar usuário");
      setRoleLookup(json);
    } catch (err: any) {
      setRoleLookupError(err.message);
    }
  };

  const addRoleToUser = async () => {
    if (!roleLookup) return;
    setAddingRole(true);
    try {
      const { error } = await supabase.from("user_roles").insert({
        user_id: roleLookup.id,
        role: roleForm.role,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
      setShowAddRole(false);
      setRoleForm({ email: "", role: "admin" });
      setRoleLookup(null);
      toast.success(`Role ${roleForm.role} adicionada com sucesso!`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao adicionar role");
    } finally {
      setAddingRole(false);
    }
  };

  const createUser = async () => {
    if (!userForm.email.trim() || !userForm.password.trim()) {
      toast.error("Email e senha são obrigatórios");
      return;
    }
    if (userForm.password.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    setCreating(true);
    try {
      const selectedPlan = PLANS.find(p => p.value === userForm.plan);
      const res = await supabase.functions.invoke("create-user-manual", {
        body: { email: userForm.email, password: userForm.password, role: userForm.role, priceId: selectedPlan?.priceId || "" },
      });

      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);

      queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
      setShowNewUser(false);
      setUserForm({ email: "", password: "", role: "owner", plan: "none" });
      toast.success("Usuário criado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar usuário");
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuários com Roles ({userRoles.length})
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setRoleForm({ email: "", role: "admin" }); setRoleLookup(null); setRoleLookupError(""); setShowAddRole(true); }}
            >
              <ShieldPlus className="w-4 h-4 mr-1" />
              Adicionar Admin
            </Button>
            <Button
              size="sm"
              className="gradient-primary text-primary-foreground"
              onClick={() => setShowNewUser(true)}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Cadastrar Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {userRoles.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhum usuário com role encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles.map((ur) => (
                  <TableRow key={ur.id}>
                    <TableCell className="font-mono text-xs">{ur.user_id}</TableCell>
                    <TableCell>
                      <Badge variant={ur.role === "admin" ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
                        <Shield className="w-3 h-3" />
                        {ur.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (window.confirm("Remover esta role do usuário?")) {
                            deleteUserRole.mutate(ur.id);
                          }
                        }}
                        title="Remover role"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Role to Existing User Dialog */}
      <Dialog open={showAddRole} onOpenChange={setShowAddRole}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldPlus className="w-5 h-5" />
              Adicionar Role a Usuário Existente
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email do usuário *</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={roleForm.email}
                  onChange={(e) => { setRoleForm({ ...roleForm, email: e.target.value }); setRoleLookup(null); setRoleLookupError(""); }}
                  placeholder="usuario@exemplo.com"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => lookupUser(roleForm.email)}
                  disabled={!roleForm.email.trim()}
                >
                  Buscar
                </Button>
              </div>
              {roleLookup && (
                <p className="text-xs text-primary mt-1 font-medium">✓ Usuário encontrado: {roleLookup.email}</p>
              )}
              {roleLookupError && (
                <p className="text-xs text-destructive mt-1">{roleLookupError}</p>
              )}
            </div>
            <div>
              <Label>Role</Label>
              <Select value={roleForm.role} onValueChange={(v: AppRole) => setRoleForm({ ...roleForm, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin (Administrador)</SelectItem>
                  <SelectItem value="owner">Owner (Proprietário)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full gradient-primary text-primary-foreground"
              onClick={addRoleToUser}
              disabled={addingRole || !roleLookup}
            >
              {addingRole ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Adicionar Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create New User Dialog */}
      <Dialog open={showNewUser} onOpenChange={setShowNewUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Cadastrar Novo Usuário
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="usuario@exemplo.com"
              />
            </div>
            <div>
              <Label>Senha *</Label>
              <Input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={userForm.role} onValueChange={(v: AppRole) => setUserForm({ ...userForm, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner (Proprietário)</SelectItem>
                  <SelectItem value="admin">Admin (Administrador)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Owner: Gerencia seu próprio negócio. Admin: Acesso total ao sistema.
              </p>
            </div>
            <div>
              <Label>Plano de Assinatura</Label>
              <Select value={userForm.plan} onValueChange={(v) => setUserForm({ ...userForm, plan: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full gradient-primary text-primary-foreground"
              onClick={createUser}
              disabled={creating || !userForm.email.trim() || !userForm.password.trim()}
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Criar Usuário
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
