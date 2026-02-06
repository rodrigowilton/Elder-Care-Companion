import { useMedications, useCreateMedication, useDeleteMedication } from "@/hooks/use-resources";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMedicationSchema } from "@shared/schema";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pill, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Medications() {
  const { data: medications, isLoading } = useMedications();
  const createMutation = useCreateMedication();
  const deleteMutation = useDeleteMedication();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof insertMedicationSchema>>({
    resolver: zodResolver(insertMedicationSchema),
    defaultValues: { name: "", dosage: "", time: "", frequency: "Daily", active: true },
  });

  async function onSubmit(data: z.infer<typeof insertMedicationSchema>) {
    try {
      await createMutation.mutateAsync(data);
      setOpen(false);
      form.reset();
      toast({ title: "Medicamento adicionado!", description: `Lembrete criado para ${data.name}` });
    } catch (err) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível adicionar." });
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este medicamento?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-lg text-muted-foreground animate-pulse">Carregando seus remédios...</div>;

  return (
    <div className="p-6 pb-24 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Medicamentos</h2>
          <p className="text-lg text-muted-foreground">Gerencie seus horários</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/30 hover:scale-105 transition-transform">
              <Plus className="w-8 h-8 text-white" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl border-2 border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold text-center">Novo Medicamento</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-lg">Nome do Remédio</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Losartana" className="input-large" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-lg">Dosagem</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 50mg" className="input-large" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-lg">Horário</FormLabel>
                        <FormControl>
                          <Input type="time" className="input-large" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-lg">Frequência</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="input-large">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Daily">Diário</SelectItem>
                            <SelectItem value="Weekly">Semanal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="btn-large w-full bg-primary text-white mt-4" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Salvando..." : "Salvar Medicamento"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {medications?.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Pill className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-500">Nenhum medicamento</h3>
            <p className="text-gray-400">Toque no + para adicionar</p>
          </div>
        ) : (
          medications?.map((med, index) => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border-2 border-border p-5 rounded-2xl shadow-sm flex items-center justify-between hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Pill size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{med.name}</h3>
                  <div className="flex items-center gap-3 text-muted-foreground font-medium mt-1">
                    <span className="bg-gray-100 px-2 py-0.5 rounded-md text-sm">{med.dosage}</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock size={14} />
                      {med.time} • {med.frequency === "Daily" ? "Diário" : "Semanal"}
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(med.id)}
                className="text-gray-400 hover:text-destructive hover:bg-destructive/10 h-12 w-12 rounded-xl"
              >
                <Trash2 size={24} />
              </Button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
