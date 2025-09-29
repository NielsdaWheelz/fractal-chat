const Chat = (props: {data}) => {
  return (
    <>Hello, {props.data.user.email}!</>
  )
}

export default Chat