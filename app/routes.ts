import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("signin", "routes/sign-in.tsx"),
  route("signup", "routes/sign-up.tsx"),
  route("api/auth/*", "routes/api.auth.ts"),
  route("api/chat/*", "routes/api.chat.ts"),
  route("api/document/*", "routes/api.document.ts"),
  route("api/upload/*", "routes/api.upload.ts"),
  route("/workspace", "routes/layout.tsx", [
    route("document-search", "routes/document-search.tsx"),
    route("document/:id", "routes/document.tsx", [
      route("chat/:chatId", "routes/chat.tsx"),
      route("chat-create", "routes/chat-create.tsx"),
      route("save-annotation", "routes/save-annotation.ts")

    ]),


    route("document-create", "routes/document-create.tsx")
  ]),
] satisfies RouteConfig;