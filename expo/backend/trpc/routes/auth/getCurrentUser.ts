import { protectedProcedure } from "../../create-context";

export const getCurrentUserProcedure = protectedProcedure.query(({ ctx }) => {
  return {
    id: ctx.user.id,
    name: ctx.user.name,
    email: ctx.user.email,
    role: ctx.user.role,
    familyId: ctx.user.familyId,
  };
});
