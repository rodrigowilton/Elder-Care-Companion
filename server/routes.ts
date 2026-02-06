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

  // Seed Data
  const seed = async () => {
    const existingAdmin = await storage.getUserByUsername("admin");
    if (!existingAdmin) {
      const password = await hashPassword("admin123");
      const admin = await storage.createUser({
        username: "admin",
        password,
        fullName: "System Admin",
      });
      // Update to admin role and extend subscription
      await db.update(users).set({
        role: "admin",
        subscriptionEndDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10)
      }).where(eq(users.id, admin.id));
      console.log("Seeded admin user");
    }

    const existingUser = await storage.getUserByUsername("idoso1");
    if (!existingUser) {
      const password = await hashPassword("123456");
      const user = await storage.createUser({
        username: "idoso1",
        password,
        fullName: "João da Silva",
      });
      console.log("Seeded idoso1 user");

      await storage.createMedication({
        userId: user.id,
        name: "Losartana",
        dosage: "50mg",
        time: "08:00",
        frequency: "Diariamente",
        active: true,
      });
    }
  };
  seed().catch(console.error);

  // Middleware to check if user is blocked or subscription expired
  const checkAccess = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const user = req.user;
    if (user.role === 'admin') return next();

    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked by administrator." });
    }

    if (new Date() > new Date(user.subscriptionEndDate)) {
      return res.status(403).json({ message: "Subscription expired. Please contact admin." });
    }

    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== 'admin') return res.sendStatus(403);
    next();
  };

  // Medications
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
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete(api.medications.delete.path, checkAccess, async (req, res) => {
    await storage.deleteMedication(Number(req.params.id));
    res.sendStatus(204);
  });

  // Appointments
  app.get(api.appointments.list.path, checkAccess, async (req, res) => {
    const appts = await storage.getAppointments(req.user!.id);
    res.json(appts);
  });

  app.post(api.appointments.create.path, checkAccess, async (req, res) => {
    try {
      const input = api.appointments.create.input.parse(req.body);
      // Ensure date is a Date object (zod coerce might be needed or frontend sends ISO string)
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
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete(api.appointments.delete.path, checkAccess, async (req, res) => {
    await storage.deleteAppointment(Number(req.params.id));
    res.sendStatus(204);
  });

  // Panic
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
