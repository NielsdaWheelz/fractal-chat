import Chat from "~/chat/chat"
import LeftSidebar from "./left-sidebar"
import RightSidebar from "./right-sidebar"

const Workspace = () => {
  return (
    <>
    <LeftSidebar />
    <Chat />
    <RightSidebar />
    </>
  )
}

export default Workspace