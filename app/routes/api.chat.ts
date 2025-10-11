import { openai } from "@ai-sdk/openai"
import { streamText, convertToModelMessages, tool, stepCountIs, createIdGenerator } from "ai"
import { z } from "zod"
import type { UIMessage } from "ai"
import { requireUser } from "~/server/auth.server"
import { saveChat } from "~/server/chats.server"
import { getAuthorDocuments, getDocumentAuthors } from "~/server/authors.server"
import { getDocument } from "~/server/documents.server"
import type { Route } from "../+types/root"
import { embedAndSearch } from "~/server/document.server"

export const maxDuration = 30

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUser(request)
  const {
    id,
    documentId,
    selection,
    selectionData,
    messages,
    mentions
  }: {
    id: string,
    documentId: string,
    selection?: string,
    selectionData?: { text: string; prefix?: string; suffix?: string },
    messages: UIMessage[],
    mentions?: { documentIds?: string[], authorIds?: string[] }
  } = await request.json();

  const document = await getDocument(documentId);
  const authors = document ? await getDocumentAuthors(documentId) : [];
  const authorNames = authors.map(a => a.name).join(", ");

  let mentionedDocumentIds: string[] = [];

  if (mentions) {
    if (mentions.documentIds) {
      mentionedDocumentIds.push(...mentions.documentIds);
    }

    if (mentions.authorIds) {
      for (const authorId of mentions.authorIds) {
        const authorDocIds = await getAuthorDocuments(authorId);
        mentionedDocumentIds.push(...authorDocIds);
      }
    }

    // kill duplicates - thanks chatty-g, never would have occured to me
    mentionedDocumentIds = [...new Set(mentionedDocumentIds)];
  }

  let systemPrompt = `Dispense with formalities.
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
Follow the moral, psychological, prosaic, and poetical examples of Socrates, Dante, Montaigne, Shakespeare, Shonagon, Jane Austen, Tolstoy, Pessoa, Emily Dickinson, Herman Melville, and C.S. Lewis.`;

  // Inject document context if available
  if (document) {
    systemPrompt += `\n\nContext: You are discussing the document "${document.title}"`;
    if (authorNames) {
      systemPrompt += ` by ${authorNames}`;
    }
    systemPrompt += `. You have access to a searchDocuments tool to semantically search this and other documents.`;
  }

  const result = streamText({
    model: openai("gpt-5-nano"),
    system: systemPrompt,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      searchDocuments: tool({
        description: `Search documents for matching chunks of text. ${document ? `You are currently discussing "${document.title}". ` : ''}You can search the current document, mentioned documents, or all documents.`,
        inputSchema: z.object({
          query: z.string().describe('The query for which you would like to return matches.'),
          topK: z.number().describe('The number of results to return.'),
          searchScope: z.enum(['current', 'mentioned', 'all']).optional().describe('Search scope: "current" searches the current document, "mentioned" searches @mentioned documents, "all" searches all accessible documents. Defaults to "current" if a document is in context, otherwise "mentioned" if mentions exist, otherwise "all".'),
        }),
        execute: async ({ query, topK, searchScope }) => {
          let docIds: string[] | undefined = undefined;
          
          if (searchScope === 'current' && documentId) {
            docIds = [documentId];
          } else if (searchScope === 'mentioned' && mentionedDocumentIds.length > 0) {
            docIds = mentionedDocumentIds;
          } else if (searchScope === 'all') {
            docIds = undefined;
          } else {
            if (documentId) {
              docIds = [documentId];
            } else if (mentionedDocumentIds.length > 0) {
              docIds = mentionedDocumentIds;
            }
          }
          
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
        messages: [...messages, ...data.messages],
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
  });
}