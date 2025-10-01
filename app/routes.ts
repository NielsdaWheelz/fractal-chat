import { type RouteConfig, index, route } from "@react-router/dev/routes";


export default [
  index("routes/home.tsx"),
  route("api/auth/*", "routes/api.auth.ts"),
  route("api/chat/*", "routes/api.chat.ts"),
  route("/workspace", "routes/layout.tsx", [
    route("chat/:id", "routes/chat-with-id.tsx"), route("chat", "routes/chat.tsx")
  ]),
] satisfies RouteConfig;
