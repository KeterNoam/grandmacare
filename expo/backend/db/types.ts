export type UserRole = "admin" | "family_member" | "caregiver";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  familyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type VitalType = "blood_pressure" | "sugar" | "heart_rate";

export interface Vital {
  id: string;
  familyId: string;
  patientName: string;
  type: VitalType;
  systolic?: number;
  diastolic?: number;
  value?: number;
  note?: string;
  createdByUserId: string;
  createdAt: Date;
}

export interface Medication {
  id: string;
  familyId: string;
  patientName: string;
  name: string;
  dosage: string;
  frequencyPerDay: number;
  instructions: string;
  timesOfDay: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  familyId: string;
  givenAt: Date;
  givenByUserId: string;
  note?: string;
}

export interface Appointment {
  id: string;
  familyId: string;
  patientName: string;
  type: string;
  dateTime: Date;
  location: string;
  notes?: string;
  responsibleUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = "open" | "in_progress" | "done";

export interface Task {
  id: string;
  familyId: string;
  patientName: string;
  title: string;
  description?: string;
  dueDate?: Date;
  status: TaskStatus;
  assignedToUserId?: string;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageStatus = "open" | "handled";

export interface Message {
  id: string;
  familyId: string;
  patientName: string;
  content: string;
  createdByUserId: string;
  createdAt: Date;
  status: MessageStatus;
}
