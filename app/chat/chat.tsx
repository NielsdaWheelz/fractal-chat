import { signOut } from "~/utils/auth-client"

const Chat = (props: {data}) => {
  const handleClick = () => {
    signOut()
  }
  return (
    <>
      Hello, {props.data.user.email}!
      <button onClick={handleClick}>Sign Out</button>
    </>
  )
}

export default Chat