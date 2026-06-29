import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/_app.tsx", [
    index("routes/home.tsx"),
    route(":slug", "routes/editions.$slug.tsx"),
    route("habits", "routes/habits.tsx"),
    route("cup", "routes/cup.tsx"),
    route("books", "routes/books.tsx"),
    route("more", "routes/more.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),
] satisfies RouteConfig;
