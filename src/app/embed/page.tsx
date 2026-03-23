import { Suspense } from "react";
import EmbedClient from "./EmbedClient";

export default function EmbedPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-zinc-500">Loading...</div>}>
      <EmbedClient />
    </Suspense>
  );
}
