// app/page.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";

const FlashcardGenerator = dynamic(
  () => import("./_components/FlashcardGenerator"),
  { ssr: false }
);

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="background">
        <FlashcardGenerator />
      </div>
    </QueryClientProvider>
  );
}
