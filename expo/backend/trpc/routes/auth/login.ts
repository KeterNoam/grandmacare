import { publicProcedure } from "../../create-context";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "../../../db/storage";
import { signToken } from "../../../lib/jwt";
import { TRPCError } from "@trpc/server";

export const loginProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const user = db.users.find((u) => u.email === input.email);
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "אימייל או סיסמה שגויים",
      });
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "אימייל או סיסמה שגויים",
      });
    }

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
