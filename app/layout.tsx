import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Placement Assistant",
  description: "AI-powered student placement analysis and interview preparation"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
