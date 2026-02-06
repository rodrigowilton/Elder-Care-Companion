import { useAppointments, useCreateAppointment, useDeleteAppointment } from "@/hooks/use-resources";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Appointments() {
  const { data: appointments, isLoading } = useAppointments();
  const createMutation = useCreateAppointment();
  const deleteMutation = useDeleteAppointment();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof insertAppointmentSchema>>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: { title: "", date: undefined, location: "", notes: "" },
  });

  async function onSubmit(data: z.infer<typeof insertAppointmentSchema>) {
    try {
      await createMutation.mutateAsync(data);
      setOpen(false);
      form.reset();
      toast({ title: "Consulta agendada!", description: `Marcado para ${format(new Date(data.date), "dd/MM")}` });
    } catch (err) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível agendar." });
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja cancelar esta consulta?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-lg text-muted-foreground animate-pulse">Carregando consultas...</div>;

  return (
    <div className="p-6 pb-24 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Consultas</h2>
          <p className="text-lg text-muted-foreground">Seus agendamentos</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 hover:scale-105 transition-transform">
              <Plus className="w-8 h-8 text-white" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl border-2 border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold text-center">Nova Consulta</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-lg">Médico ou Especialidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Cardiologista" className="input-large" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-lg">Data e Hora</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          className="input-large" 
                          {...field} 
                          value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-lg">Local (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Clínica Saúde" className="input-large" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-lg">Observações (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Levar exames anteriores..." className="text-lg rounded-xl border-2 border-input p-4" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="btn-large w-full bg-emerald-500 hover:bg-emerald-600 text-white mt-4" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Agendando..." : "Agendar Consulta"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {appointments?.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-500">Nenhuma consulta</h3>
            <p className="text-gray-400">Toque no + para adicionar</p>
          </div>
        ) : (
          appointments?.map((apt, index) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border-2 border-border p-5 rounded-2xl shadow-sm flex items-start justify-between hover:border-emerald-400 transition-colors"
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-emerald-100 text-emerald-600 flex flex-col items-center justify-center shrink-0 border border-emerald-200">
                  <span className="text-xs font-bold uppercase">{format(new Date(apt.date), "MMM", { locale: ptBR })}</span>
                  <span className="text-2xl font-bold leading-none">{format(new Date(apt.date), "dd")}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{apt.title}</h3>
                  <div className="flex flex-col gap-1 mt-1 text-muted-foreground font-medium">
                    <span className="flex items-center gap-1 text-sm">
                      <Calendar size={14} />
                      {format(new Date(apt.date), "EEEE, HH:mm", { locale: ptBR })}
                    </span>
                    {apt.location && (
                      <span className="flex items-center gap-1 text-sm">
                        <MapPin size={14} />
                        {apt.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(apt.id)}
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
