import { protectedProcedure, adminProcedure } from "../../create-context";
import { z } from "zod";
import { db, generateId } from "../../../db/storage";

export const listVitalsProcedure = protectedProcedure
  .input(
    z.object({
      patientName: z.string().optional(),
      type: z.enum(["blood_pressure", "sugar", "heart_rate"]).optional(),
    })
  )
  .query(({ ctx, input }) => {
    let vitals = db.vitals.filter((v) => v.familyId === ctx.user.familyId);

    if (input.patientName) {
      vitals = vitals.filter((v) => v.patientName === input.patientName);
    }

    if (input.type) {
      vitals = vitals.filter((v) => v.type === input.type);
    }

    return vitals
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((v) => {
        const creator = db.users.find((u) => u.id === v.createdByUserId);
        return {
          ...v,
          createdByUserName: creator?.name || "לא ידוע",
        };
      });
  });

export const createVitalProcedure = protectedProcedure
  .input(
    z.object({
      patientName: z.string(),
      type: z.enum(["blood_pressure", "sugar", "heart_rate"]),
      systolic: z.number().optional(),
      diastolic: z.number().optional(),
      value: z.number().optional(),
      note: z.string().optional(),
    })
  )
  .mutation(({ ctx, input }) => {
    const vital = {
      id: generateId(),
      familyId: ctx.user.familyId,
      patientName: input.patientName,
      type: input.type,
      systolic: input.systolic,
      diastolic: input.diastolic,
      value: input.value,
      note: input.note,
      createdByUserId: ctx.user.id,
      createdAt: new Date(),
    };

    db.vitals.push(vital);
    return vital;
  });

export const deleteVitalProcedure = adminProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ ctx, input }) => {
    const index = db.vitals.findIndex(
      (v) => v.id === input.id && v.familyId === ctx.user.familyId
    );
    if (index !== -1) {
      db.vitals.splice(index, 1);
    }
    return { success: true };
  });
