import prisma from '../config/database.js';
import { AppError } from '../utils/AppError.js';

/**
 * Returns all modules ordered by their display order,
 * annotated with whether the given user has completed each one.
 */
export async function listModules(userId: string) {
  const modules = await prisma.module.findMany({
    orderBy: { order: 'asc' },
    include: {
      progress: {
        where: { userId },
        select: { completed: true, completedAt: true },
      },
    },
  });

  return modules.map(({ progress, ...mod }) => ({
    ...mod,
    completed: progress[0]?.completed ?? false,
    completedAt: progress[0]?.completedAt ?? null,
  }));
}

/**
 * Returns a single module by ID with the user's progress for it.
 * Throws if the module does not exist.
 */
export async function getModuleById(userId: string, moduleId: string) {
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      progress: {
        where: { userId },
        select: { completed: true, completedAt: true },
      },
    },
  });

  if (!mod) {
    throw new AppError('Module not found', 404);
  }

  const { progress, ...rest } = mod;
  return {
    ...rest,
    completed: progress[0]?.completed ?? false,
    completedAt: progress[0]?.completedAt ?? null,
  };
}

/**
 * Upserts a ModuleProgress record, marking the module complete.
 * Returns the updated progress record.
 */
export async function markModuleComplete(userId: string, moduleId: string) {
  // Ensure module exists before updating progress
  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) {
    throw new AppError('Module not found', 404);
  }
  //If module is already completed do nothing.
  const existing = await prisma.moduleProgress.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });

  if (existing?.completed) {
    return existing;
  }

  const progress = await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    update: {
      completed: true,
      completedAt: new Date(),
    },
    create: {
      userId,
      moduleId,
      completed: true,
      completedAt: new Date(),
    },
  });

  return progress;
}
