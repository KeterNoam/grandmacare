import { protectedProcedure, adminProcedure } from "../../create-context";
import { z } from "zod";
import { db, generateId } from "../../../db/storage";

export const listAppointmentsProcedure = protectedProcedure.query(({ ctx }) => {
  const appointments = db.appointments
    .filter((a) => a.familyId === ctx.user.familyId)
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  return appointments.map((appointment) => {
    const responsible = appointment.responsibleUserId
      ? db.users.find((u) => u.id === appointment.responsibleUserId)
      : null;
    return {
      ...appointment,
      responsibleUserName: responsible?.name || null,
    };
  });
});

export const createAppointmentProcedure = adminProcedure
  .input(
    z.object({
      patientName: z.string(),
      type: z.string(),
      dateTime: z.date(),
      location: z.string(),
      notes: z.string().optional(),
    })
  )
  .mutation(({ ctx, input }) => {
    const appointment = {
      id: generateId(),
      familyId: ctx.user.familyId,
      patientName: input.patientName,
      type: input.type,
      dateTime: input.dateTime,
      location: input.location,
      notes: input.notes,
      responsibleUserId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.appointments.push(appointment);
    return appointment;
  });

export const updateAppointmentProcedure = adminProcedure
  .input(
    z.object({
      id: z.string(),
      type: z.string().optional(),
      dateTime: z.date().optional(),
      location: z.string().optional(),
      notes: z.string().optional(),
    })
  )
  .mutation(({ ctx, input }) => {
    const appointment = db.appointments.find(
      (a) => a.id === input.id && a.familyId === ctx.user.familyId
    );

    if (!appointment) {
      throw new Error("תור לא נמצא");
    }

    if (input.type !== undefined) appointment.type = input.type;
    if (input.dateTime !== undefined) appointment.dateTime = input.dateTime;
    if (input.location !== undefined) appointment.location = input.location;
    if (input.notes !== undefined) appointment.notes = input.notes;
    appointment.updatedAt = new Date();

    return appointment;
  });

export const deleteAppointmentProcedure = adminProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ ctx, input }) => {
    const index = db.appointments.findIndex(
      (a) => a.id === input.id && a.familyId === ctx.user.familyId
    );
    if (index !== -1) {
      db.appointments.splice(index, 1);
    }
    return { success: true };
  });

export const assignResponsibleProcedure = protectedProcedure
  .input(
    z.object({
      appointmentId: z.string(),
      userId: z.string().optional(),
    })
  )
  .mutation(({ ctx, input }) => {
    const appointment = db.appointments.find(
      (a) => a.id === input.appointmentId && a.familyId === ctx.user.familyId
    );

    if (!appointment) {
      throw new Error("תור לא נמצא");
    }

    appointment.responsibleUserId = input.userId;
    appointment.updatedAt = new Date();

    return appointment;
  });
