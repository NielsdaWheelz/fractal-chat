import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/auth/*", "routes/api.auth.ts"),
  route("api/chat/*", "routes/api.chat.ts"),
  route("/workspace", "routes/layout.tsx", [
    route("document/:id", "routes/document.tsx"),
    route("chat-create", "routes/chat-create.tsx")
  ]),
] satisfies RouteConfig;
