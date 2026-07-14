import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmallDevTools — Free online tools",
  description:
    "Simple free tools: convert Opus to MP3, cut video, flip a coin, capture web pages, and more.",
};

const themeInitScript = `
(function(){
  try {
    var s = localStorage.getItem('sdt-theme');
    var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var t = s || (d ? 'dark' : 'light');
    if (t === 'dark') document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = t;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className="site-shell flex min-h-dvh flex-col"
        style={{
          fontFamily:
            '"Helvetica Neue", Helvetica, -apple-system, BlinkMacSystemFont, Arial, sans-serif',
        }}
      >
        <AppProviders>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <footer className="border-t border-border">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5 text-sm text-text-muted sm:px-6">
              <p>
                <span className="text-text">SmallDevTools</span>
              </p>
              <p>Files stay on your device</p>
            </div>
          </footer>
        </AppProviders>
      </body>
    </html>
  );
}
