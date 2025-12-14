import { publicProcedure } from "../../create-context";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db, generateId } from "../../../db/storage";
import { signToken } from "../../../lib/jwt";
import { TRPCError } from "@trpc/server";

export const registerProcedure = publicProcedure
  .input(
    z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(["admin", "family_member", "caregiver"]),
      familyId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const existingUser = db.users.find((u) => u.email === input.email);
    if (existingUser) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "המשתמש כבר קיים במערכת",
      });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const userId = generateId();
    const familyId = input.familyId || generateId();

    const user = {
      id: userId,
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      familyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.users.push(user);

    const token = signToken({
      userId: user.id,
      familyId: user.familyId,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        familyId: user.familyId,
      },
    };
  });
