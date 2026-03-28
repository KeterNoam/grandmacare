import { createTRPCRouter } from "./create-context";
import { registerProcedure } from "./routes/auth/register";
import { loginProcedure } from "./routes/auth/login";
import { getCurrentUserProcedure } from "./routes/auth/getCurrentUser";
import {
  listFamilyUsersProcedure,
  createUserInFamilyProcedure,
} from "./routes/users";
import {
  listVitalsProcedure,
  createVitalProcedure,
  deleteVitalProcedure,
} from "./routes/vitals";
import {
  listMedicationsProcedure,
  createMedicationProcedure,
  updateMedicationProcedure,
  deleteMedicationProcedure,
  logIntakeProcedure,
  listLogsProcedure,
} from "./routes/medications";
import {
  listAppointmentsProcedure,
  createAppointmentProcedure,
  updateAppointmentProcedure,
  deleteAppointmentProcedure,
  assignResponsibleProcedure,
} from "./routes/appointments";
import {
  listTasksProcedure,
  createTaskProcedure,
  updateTaskStatusProcedure,
  assignTaskProcedure,
  deleteTaskProcedure,
} from "./routes/tasks";
import {
  listMessagesProcedure,
  createMessageProcedure,
  markAsHandledProcedure,
} from "./routes/messages";

export const appRouter = createTRPCRouter({
  auth: createTRPCRouter({
    register: registerProcedure,
    login: loginProcedure,
    getCurrentUser: getCurrentUserProcedure,
  }),
  users: createTRPCRouter({
    listFamily: listFamilyUsersProcedure,
    createInFamily: createUserInFamilyProcedure,
  }),
  vitals: createTRPCRouter({
    list: listVitalsProcedure,
    create: createVitalProcedure,
    delete: deleteVitalProcedure,
  }),
  medications: createTRPCRouter({
    list: listMedicationsProcedure,
    create: createMedicationProcedure,
    update: updateMedicationProcedure,
    delete: deleteMedicationProcedure,
    logIntake: logIntakeProcedure,
    listLogs: listLogsProcedure,
  }),
  appointments: createTRPCRouter({
    list: listAppointmentsProcedure,
    create: createAppointmentProcedure,
    update: updateAppointmentProcedure,
    delete: deleteAppointmentProcedure,
    assignResponsible: assignResponsibleProcedure,
  }),
  tasks: createTRPCRouter({
    list: listTasksProcedure,
    create: createTaskProcedure,
    updateStatus: updateTaskStatusProcedure,
    assign: assignTaskProcedure,
    delete: deleteTaskProcedure,
  }),
  messages: createTRPCRouter({
    list: listMessagesProcedure,
    create: createMessageProcedure,
    markAsHandled: markAsHandledProcedure,
  }),
});

export type AppRouter = typeof appRouter;
