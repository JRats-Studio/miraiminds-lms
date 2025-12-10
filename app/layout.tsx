import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Mirai Minds LMS",
  description: "Learning Management System by Mirai Minds",
};

/* Root layout - minimal wrapper that allows route groups to define their own html/body */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
