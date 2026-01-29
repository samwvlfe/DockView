import Header from "@/components/Header";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // If you already have an auth check, put it here so it applies to all protected pages.
  // Example patterns:
  // - server session check + redirect
  // - calling your auth helper
  // - checking cookies

  return (
    <>
      <Header />
      <main className="relative">{children}</main>
    </>
  );
}
