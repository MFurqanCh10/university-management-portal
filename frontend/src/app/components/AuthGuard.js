
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api";

const PUBLIC_PAGES = ["/login", "/register"];

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      if (PUBLIC_PAGES.includes(pathname)) {
        setChecking(false);
        return;
      }

      setChecking(true);

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        if (!cancelled) {
          setChecking(false);
        }
      } catch {
        router.replace("/login");
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);


  if (PUBLIC_PAGES.includes(pathname)) {
    return children;
  }

  return (
    <>
      <div
        aria-hidden={checking}
        style={{ visibility: checking ? "hidden" : "visible" }}
      >
        {children}
      </div>

      {checking && (
        <main className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-slate-100">
          <p className="text-slate-600">Checking authentication...</p>
        </main>
      )}
    </>
  );
}
