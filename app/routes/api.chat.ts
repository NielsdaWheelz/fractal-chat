import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { openai } from "@ai-sdk/openai"
import { streamText, convertToModelMessages, tool, stepCountIs } from "ai"
import { z } from "zod"
import type { UIMessage } from "ai"

export const maxDuration = 30

// export async function loader({ request }: LoaderFunctionArgs) {
// }

export async function action({ request }: ActionFunctionArgs) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: openai('gpt-5-nano'),
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

  return result.toUIMessageStreamResponse();
}