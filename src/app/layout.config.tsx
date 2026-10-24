import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { ThemeLogo } from "@/components/theme-logo";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <ThemeLogo />
        <span className="font-[var(--font-outfit)] font-bold text-2xl">
          Lumen Crawler
        </span>
      </>
    ),
    url: "/v2",
  },
  githubUrl: "https://github.com/Lumen-Labs/lumen-crawler-docs",
  links: [
    {
      text: "Console",
      url: "https://app.lumen-labs.ai",
      external: true,
    },
    {
      text: "API",
      url: "https://crawler.lumen-labs.ai",
      external: true,
    },
    {
      text: "Report a docs issue",
      url: "https://github.com/Lumen-Labs/lumen-crawler-docs/issues/new",
      external: true,
    },
  ],
};

export const docsSidebarBanner = (
  <div className="flex flex-col gap-2 my-3">
    <a
      className="py-3 px-4 rounded-lg border-[1.5px] flex items-center gap-2 hover:-translate-y-[1px] transition-all duration-300 bg-fd-secondary text-fd-secondary-foreground"
      href="https://app.lumen-labs.ai"
    >
      <p className="text-xs font-medium">Open the console</p>
    </a>
  </div>
);
