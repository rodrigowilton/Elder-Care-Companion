import { usePanic } from "@/hooks/use-resources";
import { Button } from "@/components/ui/button";
import { TriangleAlert, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Panic() {
  const panicMutation = usePanic();
  const { toast } = useToast();

  const handlePanic = async () => {
    try {
      await panicMutation.mutateAsync();
      toast({
        variant: "destructive",
        title: "ALERTA ENVIADO!",
        description: "Seus contatos de emergência foram notificados.",
        duration: 10000,
      });
      // Play alert sound
      const audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
      audio.play().catch(() => console.log("Audio play failed"));
    } catch (err) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao enviar alerta." });
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="space-y-4 mb-12">
        <h2 className="text-4xl font-display font-bold text-red-600">Emergência</h2>
        <p className="text-xl text-muted-foreground font-medium">Toque no botão abaixo para pedir ajuda imediatamente.</p>
      </div>

      <motion.div
        whileTap={{ scale: 0.9 }}
        animate={{ 
          boxShadow: ["0 0 0 0 rgba(239, 68, 68, 0.4)", "0 0 0 40px rgba(239, 68, 68, 0)"]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="rounded-full"
      >
        <Button
          onClick={handlePanic}
          disabled={panicMutation.isPending}
          className="w-64 h-64 rounded-full bg-destructive hover:bg-red-600 text-white shadow-2xl flex flex-col items-center justify-center gap-4 border-8 border-red-400"
        >
          <TriangleAlert size={80} strokeWidth={2.5} />
          <span className="text-3xl font-display font-bold uppercase tracking-widest">
            {panicMutation.isPending ? "ENVIANDO..." : "AJUDA"}
          </span>
        </Button>
      </motion.div>

      <div className="mt-12 w-full">
        <Button variant="outline" className="w-full h-16 rounded-2xl text-lg font-bold border-2 gap-3" onClick={() => window.open('tel:192')}>
          <Phone className="w-6 h-6" />
          Ligar para 192 (SAMU)
        </Button>
      </div>
    </div>
  );
}
