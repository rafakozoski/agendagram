import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Loader2, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

interface ClientForm {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const emptyForm: ClientForm = { name: "", email: "", phone: "", notes: "" };

export function ClientsTab() {
  const queryClient = useQueryClient();
  const { business } = useMyBusiness();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [search, setSearch] = useState("");

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("business_id", business.id)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  const upsert = useMutation({
    mutationFn: async () => {
      if (!business) throw new Error("Sem negócio");
      if (editId) {
        const { error } = await supabase.from("clients").update({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          notes: form.notes.trim(),
        }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clients").insert({
          business_id: business.id,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          notes: form.notes.trim(),
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success(editId ? "Cliente atualizado!" : "Cliente cadastrado!");
      setOpen(false);
      setForm(emptyForm);
      setEditId(null);
    },
    onError: (err: any) => toast.error("Erro: " + err.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente removido");
    },
  });

  const openEdit = (c: any) => {
    setEditId(c.id);
    setForm({ name: c.name, email: c.email || "", phone: c.phone || "", notes: c.notes || "" });
    setOpen(true);
  };

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const filtered = clients.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").includes(search)
  );

  if (!business) {
    return <p className="text-muted-foreground text-center py-12">Configure sua empresa primeiro.</p>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Clientes ({clients.length})
        </CardTitle>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 w-48"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={openNew}>
                <Plus className="w-4 h-4" /> Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editId ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-0000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas sobre o cliente" />
                </div>
                <Button
                  className="w-full"
                  disabled={!form.name.trim() || upsert.isPending}
                  onClick={() => upsert.mutate()}
                >
                  {upsert.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editId ? "Salvar" : "Cadastrar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {search ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                  <TableHead className="hidden md:table-cell">Observações</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{c.phone || c.email}</p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{c.email || "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{c.phone || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-[200px]">{c.notes || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(c)} title="Editar">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove.mutate(c.id)} title="Remover">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
