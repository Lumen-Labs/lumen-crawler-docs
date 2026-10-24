import "@/app/global.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Inter, Outfit } from "next/font/google";
import type { ReactNode } from "react";
import "katex/dist/katex.min.css";
import type { Metadata } from "next";
import { DOCS_BASE, DOCS_ORIGIN } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(DOCS_ORIGIN),
  title: {
    default: "Lumen Crawler documentation",
    template: "%s | Lumen Crawler",
  },
  description:
    "Browser-rendered crawls. Clean Markdown. Structured JSON. Task API for agents.",
};

const inter = Inter({
  subsets: ["latin"],
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.className} ${outfit.className}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="describedby" href={`${DOCS_BASE}/llms.txt`} type="text/plain" />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          search={{
            options: {
              api: "/docs/api/search",
              defaultTag: "v2",
            },
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
