// import { getSession } from "../routes/api.auth";
// import { redirect } from "react-router";
// import type { Route } from "./+types/chat";
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Form } from "react-router";

// export async function loader({ request }: Route.LoaderArgs) {
//   const session = await getSession(request);
//   if (!session?.user) {
//     return redirect("/")
//   }
//   return null
// }

const Chat = () => {
  const [newMessage, setNewMessage] = useState("");
  const { messages, sendMessage } = useChat();

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage({ text: newMessage })
    setNewMessage("")
  }

  return (
    <>
      {messages.map(message => (
        <div key={message.id}>
          {message.role}:
          {message.parts.map((part, i) => {
            switch (part.type) {
              case "text":
                return <div key={`${message.id}-${i}`}>{part.text}</div>
              case 'tool-weather':
                return (
                  <pre key={`${message.id}-${i}`}>
                    {JSON.stringify(part, null, 2)}
                  </pre>
                );
            }
          })}
        </div>
      ))}
      <Form onSubmit={handleSubmit}>
        <input value={newMessage} onChange={(event) => setNewMessage(event.currentTarget.value)} placeholder="The world is your cloister."></input>
      </Form>
    </>
  )
}

export default Chat