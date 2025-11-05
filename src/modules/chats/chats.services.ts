import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: Bun.env.TAVILY_API_KEY });

const groq = new Groq({ apiKey: Bun.env.GROQ_API_KEY });

const now = new Date().toLocaleString();

export const SYSTEM_PROMPT = `
    You are CLI-AI, a helpful, fast, and precise chat assistant designed to run in a command-line interface (CLI).

    Your objectives:
    1. Respond concisely and clearly — your output should fit naturally inside a terminal window.
    2. you have access the webSearch(q: string) tools to search the internet to get the latest and realtime data.
    
    Example interactions:
    User: How do I create a new branch in Git?
    Assistant: git checkout -b <branch-name>
    
    Date and Time: ${now}
`;

export async function getGroqChatCompletion(userPrompt: string) {
  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  let maxCall = 5;

  while (true) {
    if (!maxCall) {
      return "try Again";
    }
    maxCall--;

    const response = await groq.chat.completions.create({
      messages: messages,
      tools: [
        {
          type: "function",
          function: {
            name: "webSearch",
            description: "Search the web for latest information",
            parameters: {
              type: "object",
              properties: {
                q: {
                  type: "string",
                  description: "the query for search the web",
                },
              },
              required: ["q"],
            },
          },
        },
      ],
      tool_choice: "auto",
      temperature: 0,
      model: "llama-3.3-70b-versatile",
    });

    const responseMessage = response?.choices[0]?.message;
    const toolCalls = responseMessage?.tool_calls;

    if (!toolCalls) {
      return responseMessage?.content;
    }

    const availableFunctions = {
      webSearch: webSearch,
    };

    messages.push(responseMessage);

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToCall =
        availableFunctions[functionName as keyof typeof availableFunctions];
      const functionArgs = JSON.parse(toolCall.function.arguments);

      const functionResponse = await functionToCall(functionArgs.q);

      messages.push({
        tool_call_id: toolCall.id,
        role: "tool",
        content: functionResponse,
      });
    }
  }
}

async function webSearch(q: string) {
  const response = await tvly.search(q);

  return response.results.map((r) => r.content).join("\n\n");
}
