import { SectionLocalesProvider } from "@/lib/section-locales-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <SectionLocalesProvider>{children}</SectionLocalesProvider>;
}
