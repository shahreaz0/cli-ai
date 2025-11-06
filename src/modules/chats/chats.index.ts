import { Elysia, t } from "elysia";
import { getGroqChatCompletion } from "./chats.services";
import { prisma } from "../../../prisma";

export const chat = new Elysia({ prefix: "/chats", tags: ["Chats"] });

chat.get("/:sessionId", async (ctx) => {
  const chats = await prisma.chat.findMany({
    where: {
      sessionId: ctx.params.sessionId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { data: chats };
});
chat.post(
  "/:sessionId",
  async (ctx) => {
    await prisma.chat.create({
      data: {
        sessionId: ctx.params.sessionId,
        content: ctx.body.content,
        role: "USER",
      },
    });

    const chatCompletion = await getGroqChatCompletion(
      ctx.body.content,
      ctx.params.sessionId
    );

    await prisma.chat.create({
      data: {
        sessionId: ctx.params.sessionId,
        content: chatCompletion || "",
        role: "ASSISTANT",
      },
    });

    const res = {
      content: chatCompletion,
      role: "ASSISTANT",
    };

    return res;
  },
  {
    body: t.Object({
      content: t.String(),
    }),
  }
);
