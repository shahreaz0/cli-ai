import { Elysia, t } from "elysia";

export const chat = new Elysia({ prefix: "/chats", tags: ["Chats"] });

chat.get("/:sessionId", (ctx) => ctx.params.sessionId);

chat.post("/:sessionId", (ctx) => ctx.body, {
  body: t.Object({
    message: t.String(),
  }),
});
