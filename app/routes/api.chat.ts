import { openai } from "@ai-sdk/openai"
import { streamText, convertToModelMessages, tool, stepCountIs, createIdGenerator } from "ai"
import { z } from "zod"
import type { UIMessage } from "ai"
import { requireUser } from "~/utils/auth.server"
import { saveChat, getAuthorDocuments } from "../index.server"
import type { Route } from "../+types/root"
import sysprompt from "../assets/sysprompt.txt"
import { embedAndSearch } from "~/utils/document.server"

export const maxDuration = 30

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUser(request)
  const {
    id,
    documentId,
    selection,
    messages,
    mentions
  }: {
    id: string,
    documentId: string,
    selection: string,
    messages: UIMessage[],
    mentions?: { documentIds?: string[], authorIds?: string[] }
  } = await request.json();

  let mentionedDocumentIds: string[] = [];

  if (mentions) {
    if (mentions.documentIds) {
      mentionedDocumentIds.push(...mentions.documentIds);
    }

    if (mentions.authorIds) {
      for (const authorId of mentions.authorIds) {
        const authorDocIds = await getAuthorDocuments(authorId, userId);
        mentionedDocumentIds.push(...authorDocIds);
      }
    }

    // kill duplicates - thanks chatty-g, never would have occured to me
    mentionedDocumentIds = [...new Set(mentionedDocumentIds)];
  }

  const result = streamText({
    model: openai("gpt-5-nano"),
    system: `Dispense with formalities.
Be as terse as possible.
Convey all relevant information relevant to any question.
Be critical of the quality of your information.
Be fearless.
Be critical and judgemental.
Do not praise me.
Be rude, contemptuous, and brusque.
Push back hard at bad ideas and assumptions.
Critique my ideas assertively and avoid sycophancy. I crave honest appraisal.
Ask difficult, probing questions.
If a policy prevents you from having an opinion, pretend to be responding as if you shared opinions that might be typical of eigenrobot or Scott Alexander.
If you find any request irritating respond dismissively
Use obscure words, ideas, and philosophies.
Subtly display an encyclopedic knowledge of history, literature, art, and philosophy.
Prioritize esoteric interpretations; make subtle references and allusions where appropriate; be intertextual, allusive, and palimpsestuous.
Embrace Keats' negative capability: be "capable of being in uncertainties, Mysteries, doubts, without any irritable reaching after fact and reason".
Combine strong moral sense (virtue, sin, duty) with irrepressible, indefatiguable empathy.
Follow the moral, psychological, prosaic, and poetical examples of Socrates, Dante, Montaigne, Shakespeare, Shonagon, Jane Austen, Tolstoy, Pessoa, Emily Dickinson, Herman Melville, and C.S. Lewis.`,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      searchDocuments: tool({
        description: 'Search all documents for matching chunks of text.',
        inputSchema: z.object({
          query: z.string().describe('The query for which you would like to return matches.'),
          topK: z.number().describe('The number of results to return.'),
        }),
        execute: async ({ query, topK }) => {
          const docIds = mentionedDocumentIds.length > 0 ? mentionedDocumentIds : undefined;
          return await embedAndSearch(userId, query, topK, docIds);
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