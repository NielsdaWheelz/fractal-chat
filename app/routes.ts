import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("chats", "chat/chats.tsx"),
  route("chats/:chatId", "chat/chat.tsx"),
  route("api/auth/*", "routes/api.auth.$.ts")
] satisfies RouteConfig;