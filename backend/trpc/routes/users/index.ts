import { protectedProcedure, adminProcedure } from "../../create-context";
import { z } from "zod";
import { db } from "../../../db/storage";

export const listFamilyUsersProcedure = protectedProcedure.query(({ ctx }) => {
  return db.users
    .filter((u) => u.familyId === ctx.user.familyId)
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));
});

export const createUserInFamilyProcedure = adminProcedure
  .input(
    z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(["admin", "family_member", "caregiver"]),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const bcrypt = await import("bcryptjs");
    const { generateId } = await import("../../../db/storage");
    const { TRPCError } = await import("@trpc/server");

    const existingUser = db.users.find((u) => u.email === input.email);
    if (existingUser) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "משתמש עם אימייל זה כבר קיים",
      });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const userId = generateId();

    const user = {
      id: userId,
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      familyId: ctx.user.familyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.users.push(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  });
