import { openai } from "@ai-sdk/openai"
import { streamText, convertToModelMessages, tool, stepCountIs, createIdGenerator } from "ai"
import { z } from "zod"
import type { UIMessage } from "ai"
import { requireUser } from "~/utils/auth.server"
import { saveChat } from "../index.server"
import type { Route } from "../+types/root"
import sysprompt from "../assets/sysprompt.txt"
import { embedAndSearch } from "./api.document"

export const maxDuration = 30

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUser(request)
  const { id, documentId, selection, messages }: { id: string, documentId: string, selection: string, messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: openai("gpt-5-nano"),
    system: sysprompt,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      searchDocuments: tool({
        description: 'Search all documents for matching chunks of text.',
        inputSchema: z.object({
          query: z.string().describe('The query for which you would like to return matches.'),
          topK: z.number().describe('The number of results to return.'),
        }),
        execute: async ({query, topK}) => {
          return await embedAndSearch(userId, query, topK);
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse({
    generateMessageId: createIdGenerator(),
    onFinish: (data) => {
      saveChat({
        id: id,
        userId: userId,
        documentId: documentId,
        messages: [...messages, ...data.messages]
      })
    }
  });
}