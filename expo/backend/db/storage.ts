import {
  User,
  Vital,
  Medication,
  MedicationLog,
  Appointment,
  Task,
  Message,
} from "./types";

export const db = {
  users: [] as User[],
  vitals: [] as Vital[],
  medications: [] as Medication[],
  medicationLogs: [] as MedicationLog[],
  appointments: [] as Appointment[],
  tasks: [] as Task[],
  messages: [] as Message[],
};

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
