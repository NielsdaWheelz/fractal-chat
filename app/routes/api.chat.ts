import { openai } from "@ai-sdk/openai"
import { streamText, convertToModelMessages, tool, stepCountIs, createIdGenerator } from "ai"
import { z } from "zod"
import type { UIMessage } from "ai"
import { requireUser } from "~/utils/auth.server"
import { saveChat } from ".."
import type { Route } from "../+types/root"

export const maxDuration = 30

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUser(request)
  const { id, messages }: { id: string, messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: openai("gpt-5-nano"),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
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

  return result.toUIMessageStreamResponse({
    generateMessageId: createIdGenerator(),
    onFinish: (data) => {
      saveChat({
        id: id,
        userId: userId,
        messages: [...messages, ...data.messages]
      })
    }
  });
}