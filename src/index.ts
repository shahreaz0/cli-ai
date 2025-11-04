import { Elysia } from "elysia";
import { chat } from "./modules/chats/chats.index";
import { openapi } from "@elysiajs/openapi";

const app = new Elysia({ tags: ["Index"] });

app.use(
  openapi({
    documentation: {
      info: {
        title: "AI Assistant",
        version: "1.0.0",
      },
    },
    scalar: {
      metaData: {
        title: "AI Assistant",
        description: "AI Assistant",
      },
    },
  })
);

app.use(chat);

app.get("/", () => ({ status: "OK", timestamp: Date.now() }));

app.listen(3000);
