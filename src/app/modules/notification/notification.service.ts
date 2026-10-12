import prisma from "../../../shared/prisma";

const getUserWiseNotifyOptions = async (userId: string) => {
  const notifyOptions = await prisma.notifyOption.findUnique({
    where: { userId },
    omit: {
      id: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
    },
  });

  return notifyOptions;
};

const toggleNotifyOptionIntoDB = async (
  userId: string,
  option: keyof Omit<
    import("@prisma/client").NotifyOption,
    "id" | "userId" | "createdAt" | "updatedAt" | "user"
  >,
) => {
  const notifyOption = await prisma.notifyOption.findUniqueOrThrow({
    where: { userId },
  });

  const updated = await prisma.notifyOption.updateMany({
    where: { userId },
    data: {
      [option]: !notifyOption[option],
    },
  });

  return updated
};

export const notificationService = {
  getUserWiseNotifyOptions,
    toggleNotifyOptionIntoDB,
};
