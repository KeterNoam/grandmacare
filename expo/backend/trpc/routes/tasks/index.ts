import { protectedProcedure, adminProcedure } from "../../create-context";
import { z } from "zod";
import { db, generateId } from "../../../db/storage";

export const listTasksProcedure = protectedProcedure.query(({ ctx }) => {
  const tasks = db.tasks
    .filter((t) => t.familyId === ctx.user.familyId)
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  return tasks.map((task) => {
    const creator = db.users.find((u) => u.id === task.createdByUserId);
    const assigned = task.assignedToUserId
      ? db.users.find((u) => u.id === task.assignedToUserId)
      : null;
    return {
      ...task,
      createdByUserName: creator?.name || "לא ידוע",
      assignedToUserName: assigned?.name || null,
    };
  });
});

export const createTaskProcedure = protectedProcedure
  .input(
    z.object({
      patientName: z.string(),
      title: z.string(),
      description: z.string().optional(),
      dueDate: z.date().optional(),
    })
  )
  .mutation(({ ctx, input }) => {
    const task = {
      id: generateId(),
      familyId: ctx.user.familyId,
      patientName: input.patientName,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      status: "open" as const,
      assignedToUserId: undefined,
      createdByUserId: ctx.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.tasks.push(task);
    return task;
  });

export const updateTaskStatusProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.enum(["open", "in_progress", "done"]),
    })
  )
  .mutation(({ ctx, input }) => {
    const task = db.tasks.find(
      (t) => t.id === input.id && t.familyId === ctx.user.familyId
    );

    if (!task) {
      throw new Error("משימה לא נמצאה");
    }

    task.status = input.status;
    task.updatedAt = new Date();

    return task;
  });

export const assignTaskProcedure = protectedProcedure
  .input(
    z.object({
      taskId: z.string(),
      userId: z.string().optional(),
    })
  )
  .mutation(({ ctx, input }) => {
    const task = db.tasks.find(
      (t) => t.id === input.taskId && t.familyId === ctx.user.familyId
    );

    if (!task) {
      throw new Error("משימה לא נמצאה");
    }

    task.assignedToUserId = input.userId;
    task.updatedAt = new Date();

    return task;
  });

export const deleteTaskProcedure = adminProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ ctx, input }) => {
    const index = db.tasks.findIndex(
      (t) => t.id === input.id && t.familyId === ctx.user.familyId
    );
    if (index !== -1) {
      db.tasks.splice(index, 1);
    }
    return { success: true };
  });
