import { protectedProcedure, adminProcedure } from "../../create-context";
import { z } from "zod";
import { db, generateId } from "../../../db/storage";

export const listMedicationsProcedure = protectedProcedure
  .input(
    z.object({
      patientName: z.string().optional(),
      isActive: z.boolean().optional(),
    })
  )
  .query(({ ctx, input }) => {
    let medications = db.medications.filter(
      (m) => m.familyId === ctx.user.familyId
    );

    if (input.patientName) {
      medications = medications.filter((m) => m.patientName === input.patientName);
    }

    if (input.isActive !== undefined) {
      medications = medications.filter((m) => m.isActive === input.isActive);
    }

    return medications.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  });

export const createMedicationProcedure = adminProcedure
  .input(
    z.object({
      patientName: z.string(),
      name: z.string(),
      dosage: z.string(),
      frequencyPerDay: z.number(),
      instructions: z.string(),
      timesOfDay: z.array(z.string()),
    })
  )
  .mutation(({ ctx, input }) => {
    const medication = {
      id: generateId(),
      familyId: ctx.user.familyId,
      patientName: input.patientName,
      name: input.name,
      dosage: input.dosage,
      frequencyPerDay: input.frequencyPerDay,
      instructions: input.instructions,
      timesOfDay: input.timesOfDay,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.medications.push(medication);
    return medication;
  });

export const updateMedicationProcedure = adminProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      dosage: z.string().optional(),
      frequencyPerDay: z.number().optional(),
      instructions: z.string().optional(),
      timesOfDay: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    })
  )
  .mutation(({ ctx, input }) => {
    const medication = db.medications.find(
      (m) => m.id === input.id && m.familyId === ctx.user.familyId
    );

    if (!medication) {
      throw new Error("תרופה לא נמצאה");
    }

    if (input.name !== undefined) medication.name = input.name;
    if (input.dosage !== undefined) medication.dosage = input.dosage;
    if (input.frequencyPerDay !== undefined)
      medication.frequencyPerDay = input.frequencyPerDay;
    if (input.instructions !== undefined)
      medication.instructions = input.instructions;
    if (input.timesOfDay !== undefined) medication.timesOfDay = input.timesOfDay;
    if (input.isActive !== undefined) medication.isActive = input.isActive;
    medication.updatedAt = new Date();

    return medication;
  });

export const deleteMedicationProcedure = adminProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ ctx, input }) => {
    const index = db.medications.findIndex(
      (m) => m.id === input.id && m.familyId === ctx.user.familyId
    );
    if (index !== -1) {
      db.medications.splice(index, 1);
    }
    return { success: true };
  });

export const logIntakeProcedure = protectedProcedure
  .input(
    z.object({
      medicationId: z.string(),
      note: z.string().optional(),
    })
  )
  .mutation(({ ctx, input }) => {
    const medication = db.medications.find(
      (m) => m.id === input.medicationId && m.familyId === ctx.user.familyId
    );

    if (!medication) {
      throw new Error("תרופה לא נמצאה");
    }

    const log = {
      id: generateId(),
      medicationId: input.medicationId,
      familyId: ctx.user.familyId,
      givenAt: new Date(),
      givenByUserId: ctx.user.id,
      note: input.note,
    };

    db.medicationLogs.push(log);
    return log;
  });

export const listLogsProcedure = protectedProcedure
  .input(z.object({ medicationId: z.string() }))
  .query(({ ctx, input }) => {
    const logs = db.medicationLogs
      .filter(
        (l) =>
          l.medicationId === input.medicationId &&
          l.familyId === ctx.user.familyId
      )
      .sort((a, b) => b.givenAt.getTime() - a.givenAt.getTime());

    return logs.map((log) => {
      const giver = db.users.find((u) => u.id === log.givenByUserId);
      return {
        ...log,
        givenByUserName: giver?.name || "לא ידוע",
      };
    });
  });
