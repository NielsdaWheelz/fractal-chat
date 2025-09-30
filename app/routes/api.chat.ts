import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { openai } from "@ai-sdk/openai"
import { streamText, convertToModelMessages } from "ai"
import type { UIMessage } from "ai"

export const maxDuration = 30

// export async function loader({ request }: LoaderFunctionArgs) {
// }

  // export async function action({ request }: ActionFunctionArgs) {
  //   // won't work for streaming. Actions expect you to return JSON/redirects, not a continuous stream.
    
  //   // const { messages }: { messages: UIMessage[] } = await request.json();

  //   // const result = streamText({
  //   //   model: openai('gpt-4o'),
  //   //   messages: convertToModelMessages(messages),
  //   // });

  //   // return result.toUIMessageStreamResponse();
  // }
  
  // export async function POST(request: Request) {
export async function action({ request }: ActionFunctionArgs) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}