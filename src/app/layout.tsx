import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { GamesProvider } from "@/hooks/use-games";
import { StudentGameProvider } from "@/hooks/useStudentGame";

export const metadata: Metadata = {
  title: "Dirección en acción",
  description: "A business simulation game for students and teachers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <GamesProvider>
          <StudentGameProvider>
            {children}
            <Toaster />
          </StudentGameProvider>
        </GamesProvider>
      </body>
    </html>
  );
}
