import { Elysia, t } from "elysia";
import { getGroqChatCompletion } from "./chats.services";

export const chat = new Elysia({ prefix: "/chats", tags: ["Chats"] });

chat.get("/:sessionId", (ctx) => ctx.params.sessionId);

chat.post(
  "/:sessionId",
  async (ctx) => {
    const chatCompletion = await getGroqChatCompletion(ctx.body.content);

    const res = {
      content: chatCompletion,
      role: "ASSISTANT",
    };

    return res;
  },
  {
    body: t.Object({
      content: t.String(),
      role: t.Union([t.Literal("USER"), t.Literal("ASSISTANT")]),
    }),
  }
);
