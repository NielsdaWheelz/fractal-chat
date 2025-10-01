import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { openai } from "@ai-sdk/openai"
import { streamText, convertToModelMessages, tool, stepCountIs, createIdGenerator } from "ai"
import { z } from "zod"
import type { UIMessage } from "ai"
import { requireUser } from "~/utils/auth"
import { saveChat } from ".."

export const maxDuration = 30

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUser(request)
  // `useChat` will POST JSON { messages: UIMessage[] }
  const { id, messages }: { id: string, messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: openai("gpt-4.1-mini"),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5), // stop after a maximum of 5 steps if tools were called
    tools: {
      weather: tool({
        description: 'Get the weather in a location',
        inputSchema: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => ({
          location,
          temperature: 72 + Math.floor(Math.random() * 21) - 10,
        }),
      }),
    },
  });

  // returns SSE with the UI Message Stream protocol
  return result.toUIMessageStreamResponse({
    generateMessageId: createIdGenerator({
      prefix: 'msg',
      size: 16,
    }),
    onFinish: (data) => {
      saveChat({
        id: id,
        userId: userId,
        messages: [...messages, ...data.messages]
      })
    }
  });
}