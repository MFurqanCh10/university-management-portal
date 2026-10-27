
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "./components/ConditionalNavbar.jsx";
import AuthGuard from "./components/AuthGuard";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export const metadata = {
  title: "Student Management Portal",
  description: "Manage students, departments, and courses",
};


export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense
          fallback={
            <main className="flex min-h-screen items-center justify-center">
              Loading portal...
            </main>
          }
        >
          <AuthGuard>
            <ConditionalNavbar />
            {children}
          </AuthGuard>
        </Suspense>
      </body>
    </html>
  );
}
