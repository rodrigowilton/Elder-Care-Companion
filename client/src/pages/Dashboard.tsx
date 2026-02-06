import { Link } from "wouter";
import { Pill, Calendar, TriangleAlert, ChevronRight, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="p-6 pb-24 max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-display font-bold text-foreground">O que deseja fazer?</h2>
        <p className="text-lg text-muted-foreground">Escolha uma opção abaixo</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        <Link href="/medicamentos">
          <motion.div variants={item} className="card-action bg-blue-50 border-blue-100 hover:border-blue-400">
            <div className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Pill size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900">Medicamentos</h3>
              <p className="text-blue-700 font-medium">Meus remédios e horários</p>
            </div>
          </motion.div>
        </Link>

        <Link href="/consultas">
          <motion.div variants={item} className="card-action bg-emerald-50 border-emerald-100 hover:border-emerald-400">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Calendar size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-emerald-900">Consultas</h3>
              <p className="text-emerald-700 font-medium">Médicos e datas</p>
            </div>
          </motion.div>
        </Link>

        <Link href="/panico">
          <motion.div variants={item} className="card-action bg-red-50 border-red-100 hover:border-red-400">
            <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
              <TriangleAlert size={32} strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-900">Botão de Pânico</h3>
              <p className="text-red-700 font-medium">Ajuda imediata</p>
            </div>
          </motion.div>
        </Link>
      </motion.div>

      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-display font-bold mb-2">Plano Street50+</h3>
          <p className="opacity-90 text-lg mb-6">Sua assinatura está ativa e protegendo você.</p>
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl font-bold backdrop-blur-sm border border-white/10">
            <User size={18} />
            <span>Membro Premium</span>
          </div>
        </div>
      </div>
    </div>
  );
}
