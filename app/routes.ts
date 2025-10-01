import { type RouteConfig, index, route } from "@react-router/dev/routes";


export default [
  index("routes/home.tsx"),
  route("api/auth/*", "routes/api.auth.ts"),
  route("api/chat/*", "routes/api.chat.ts"),
  route("chat", "chat/chat.tsx"),
  route("/", "routes/layout.tsx", [
    route("workspace", "workspace/workspace.tsx"),
    // route("chat", "chat/chat.tsx"),
    route("chats", "chat/chats.tsx"),
  ]),
] satisfies RouteConfig;
