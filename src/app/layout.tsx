import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { AppProviders } from "@/components/AppProviders";
import { Analytics } from "@/components/Analytics";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { SITE_NAME, SITE_URL } from "@/lib/tools";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Free online tools`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Free browser tools: remove backgrounds, generate QR codes, extract audio, convert Opus to MP3, cut video, and more. No signup.",
  applicationName: SITE_NAME,
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/logo.svg",
    apple: [{ url: "/logo.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Free online tools`,
    description:
      "Free browser tools for everyday tasks. Privacy-friendly. No signup.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — Free online tools`,
    description: "Free browser tools for everyday tasks.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
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
          <Analytics />
          <ServiceWorkerRegister />
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <footer className="border-t border-border">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-text-muted sm:px-6">
              <p>
                <span className="text-text">{SITE_NAME}</span>
              </p>
              <div className="flex gap-4">
                <a href="/suggest" className="hover:text-text">
                  Suggest a tool
                </a>
                <span>Files stay on your device</span>
              </div>
            </div>
          </footer>
        </AppProviders>
      </body>
    </html>
  );
}
