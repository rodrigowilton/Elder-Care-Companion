import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").default("user").notNull(), // 'admin' | 'user'
  isBlocked: boolean("is_blocked").default(false).notNull(),
  subscriptionEndDate: timestamp("subscription_end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  time: text("time").notNull(), // "08:00"
  frequency: text("frequency").notNull(), // "Daily", "Weekly"
  active: boolean("active").default(true).notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(), // Doctor or purpose
  date: timestamp("date").notNull(),
  location: text("location"),
  notes: text("notes"),
});

export const panicLogs = pgTable("panic_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  triggeredAt: timestamp("triggered_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  medications: many(medications),
  appointments: many(appointments),
  panicLogs: many(panicLogs),
}));

export const medicationsRelations = relations(medications, ({ one }) => ({
  user: one(users, {
    fields: [medications.userId],
    references: [users.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  isBlocked: true, 
  role: true, 
  subscriptionEndDate: true 
});

export const insertMedicationSchema = createInsertSchema(medications).omit({ 
  id: true, 
  userId: true 
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({ 
  id: true, 
  userId: true 
});

export const insertPanicLogSchema = createInsertSchema(panicLogs).omit({ 
  id: true, 
  userId: true,
  triggeredAt: true 
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type PanicLog = typeof panicLogs.$inferSelect;
