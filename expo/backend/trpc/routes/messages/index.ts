import { protectedProcedure } from "../../create-context";
import { z } from "zod";
import { db, generateId } from "../../../db/storage";

export const listMessagesProcedure = protectedProcedure.query(({ ctx }) => {
  const messages = db.messages
    .filter((m) => m.familyId === ctx.user.familyId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return messages.map((message) => {
    const creator = db.users.find((u) => u.id === message.createdByUserId);
    return {
      ...message,
      createdByUserName: creator?.name || "לא ידוע",
    };
  });
});

export const createMessageProcedure = protectedProcedure
  .input(
    z.object({
      patientName: z.string(),
      content: z.string(),
    })
  )
  .mutation(({ ctx, input }) => {
    const message = {
      id: generateId(),
      familyId: ctx.user.familyId,
      patientName: input.patientName,
      content: input.content,
      createdByUserId: ctx.user.id,
      createdAt: new Date(),
      status: "open" as const,
    };

    db.messages.push(message);
    return message;
  });

export const markAsHandledProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ ctx, input }) => {
    const message = db.messages.find(
      (m) => m.id === input.id && m.familyId === ctx.user.familyId
    );

    if (!message) {
      throw new Error("הודעה לא נמצאה");
    }

    message.status = "handled";
    return message;
  });
