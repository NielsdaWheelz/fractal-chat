import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/auth/*", "routes/api.auth.ts"),
  route("api/chat/*", "routes/api.chat.ts"),
  route("api/document/*", "routes/api.document.ts"),
  route("/workspace", "routes/layout.tsx", [
    route("document/:id", "routes/document.tsx"),
    route("chat/:id", "routes/chat.tsx"),
    route("chat-create", "routes/chat-create.tsx"),
    route("document-create", "routes/document-create.tsx")
  ]),
] satisfies RouteConfig;
