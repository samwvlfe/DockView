"use client";
import Header from "@/components/Header";
import { WebSocketProvider } from "@/contexts/WebSocketContext";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <WebSocketProvider>
      <Header />
      <main className="relative">{children}</main>
    </WebSocketProvider>
  );
}
