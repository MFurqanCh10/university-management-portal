"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  const authPages = ["/login", "/register"];

  if (authPages.includes(pathname)) {
    return null;
  }

  return <Navbar />;
}