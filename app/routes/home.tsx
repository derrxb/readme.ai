import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About | ReadMe.ai" },
    {
      name: "description",
      content:
        "Convert any articles to audio text to reach different audiences",
    },
  ];
}

export default function Home() {
  return null;
}
