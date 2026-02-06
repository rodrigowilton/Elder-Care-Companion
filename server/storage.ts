import { db } from "./db";
import {
  users, medications, appointments, panicLogs,
  type User, type InsertUser, type Medication, type InsertMedication,
  type Appointment, type InsertAppointment, type PanicLog
} from "@shared/schema";
import { eq, lt } from "drizzle-orm";

export interface IStorage {
  // Users & Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBlockStatus(id: number, isBlocked: boolean): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Medications
  getMedications(userId: number): Promise<Medication[]>;
  createMedication(medication: InsertMedication & { userId: number }): Promise<Medication>;
  deleteMedication(id: number): Promise<void>;
  
  // Appointments
  getAppointments(userId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment & { userId: number }): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
  
  // Panic
  createPanicLog(userId: number): Promise<PanicLog>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

    const [user] = await db.insert(users).values({
      ...insertUser,
      role: 'user',
      isBlocked: false,
      subscriptionEndDate,
      createdAt: new Date(),
    }).returning();
    return user;
  }

  async updateUserBlockStatus(id: number, isBlocked: boolean): Promise<User> {
    const [user] = await db.update(users)
      .set({ isBlocked })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getMedications(userId: number): Promise<Medication[]> {
    return await db.select().from(medications).where(eq(medications.userId, userId));
  }

  async createMedication(medication: InsertMedication & { userId: number }): Promise<Medication> {
    const [newMed] = await db.insert(medications).values(medication).returning();
    return newMed;
  }

  async deleteMedication(id: number): Promise<void> {
    await db.delete(medications).where(eq(medications.id, id));
  }

  async getAppointments(userId: number): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.userId, userId));
  }

  async createAppointment(appointment: InsertAppointment & { userId: number }): Promise<Appointment> {
    const [newAppt] = await db.insert(appointments).values(appointment).returning();
    return newAppt;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  async createPanicLog(userId: number): Promise<PanicLog> {
    const [log] = await db.insert(panicLogs).values({
      userId,
      triggeredAt: new Date(),
    }).returning();
    return log;
  }
}

export const storage = new DatabaseStorage();
