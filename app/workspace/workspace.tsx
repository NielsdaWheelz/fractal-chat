import Chat from "~/chat/chat"
import LeftSidebar from "./left-sidebar"
import RightSidebar from "./right-sidebar"

const Workspace = () => {
  return (
    <>
      <div className="flex flex-row">
        <LeftSidebar />
        <RightSidebar />
      </div>
    </>
  )
}

export default Workspace