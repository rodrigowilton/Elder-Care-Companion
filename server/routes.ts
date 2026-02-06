import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, hashPassword } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth (Passport)
  setupAuth(app);

  // --- SEED DATA DESATIVADO PARA EVITAR ERRO DE CONEXÃO NO STARTUP ---
  /* const seed = async () => {
    // Comentamos esta lógica pois o erro ENOTFOUND impede o servidor de iniciar
    // Você pode criar usuários manualmente pelo painel do Supabase.
  };
  seed().catch(console.error);
  */

  // Middleware para checar bloqueio ou assinatura expirada
  const checkAccess = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const user = req.user;
    if (user.role === 'admin') return next();

    if (user.isBlocked) {
      return res.status(403).json({ message: "Sua conta está bloqueada pelo administrador." });
    }

    if (new Date() > new Date(user.subscriptionEndDate)) {
      return res.status(403).json({ message: "Assinatura expirada. Contate o admin." });
    }

    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== 'admin') return res.sendStatus(403);
    next();
  };

  // Medicamentos
  app.get(api.medications.list.path, checkAccess, async (req, res) => {
    const meds = await storage.getMedications(req.user!.id);
    res.json(meds);
  });

  app.post(api.medications.create.path, checkAccess, async (req, res) => {
    try {
      const input = api.medications.create.input.parse(req.body);
      const med = await storage.createMedication({ ...input, userId: req.user!.id });
      res.status(201).json(med);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Erro interno no servidor" });
      }
    }
  });

  app.delete(api.medications.delete.path, checkAccess, async (req, res) => {
    await storage.deleteMedication(Number(req.params.id));
    res.sendStatus(204);
  });

  // Consultas (Appointments)
  app.get(api.appointments.list.path, checkAccess, async (req, res) => {
    const appts = await storage.getAppointments(req.user!.id);
    res.json(appts);
  });

  app.post(api.appointments.create.path, checkAccess, async (req, res) => {
    try {
      const input = api.appointments.create.input.parse(req.body);
      const appt = await storage.createAppointment({ 
        ...input, 
        userId: req.user!.id,
        date: new Date(input.date) 
      });
      res.status(201).json(appt);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Erro interno no servidor" });
      }
    }
  });

  app.delete(api.appointments.delete.path, checkAccess, async (req, res) => {
    await storage.deleteAppointment(Number(req.params.id));
    res.sendStatus(204);
  });

  // Pânico
  app.post(api.panic.trigger.path, checkAccess, async (req, res) => {
    const log = await storage.createPanicLog(req.user!.id);
    res.status(201).json(log);
  });

  // Admin
  app.get(api.admin.users.path, requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.patch(api.admin.toggleBlock.path, requireAdmin, async (req, res) => {
    const isBlocked = req.body.isBlocked;
    const user = await storage.updateUserBlockStatus(Number(req.params.id), isBlocked);
    res.json(user);
  });

  return httpServer;
}