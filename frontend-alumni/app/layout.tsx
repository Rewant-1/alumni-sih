import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SocketProvider } from "@/lib/socket-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sarthak - Alumni Connect",
  description: "Your network. Your opportunities. Your legacy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#f8fafc]">
        <ErrorBoundary>
          <SocketProvider>
            <Toaster />
            {children}
          </SocketProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
