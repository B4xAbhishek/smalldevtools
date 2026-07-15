import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { AppProviders } from "@/components/AppProviders";
import { Analytics } from "@/components/Analytics";
import { InstallAppBanner } from "@/components/InstallApp";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { VisitorCounter } from "@/components/VisitorCounter";
import { SITE_NAME, SITE_URL } from "@/lib/tools";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Coin Flip, WhatsApp Audio to MP3, QR Code & 7 Up 7 Down`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Free online coin flip / toss, WhatsApp audio (Opus) to MP3 converter, QR code generator, and 7 Up 7 Down game — plus more browser tools. No signup.",
  keywords: [
    "coin flip",
    "coin toss",
    "whatsapp audio to mp3",
    "opus to mp3",
    "qr code generator",
    "7 up 7 down",
    "7up 7down game",
    "free online tools",
  ],
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
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Coin Flip, WhatsApp to MP3, QR & 7 Up 7 Down`,
    description:
      "Coin toss, WhatsApp Opus to MP3, free QR codes, and 7 Up 7 Down — free browser tools. No signup.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — Coin Flip, WhatsApp to MP3, QR & 7 Up 7 Down`,
    description:
      "Free coin flip, WhatsApp audio to MP3, QR code generator, and 7 Up 7 Down game.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeInitScript = `
(function(){
  try {
    var s = localStorage.getItem('sdt-theme');
    var t = (s === 'light' || s === 'dark') ? s : 'dark';
    if (t === 'dark') document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = t;
  } catch (e) {}
})();
`;

/** Runs before paint — kills leftover SWs that flood localhost Network tab */
const swKillScript = `
(function(){
  try {
    var h = location.hostname;
    var local = h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
    if (!local || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.getRegistrations().then(function(regs){
      return Promise.all(regs.map(function(r){ return r.unregister(); }));
    }).then(function(){
      if (!('caches' in window)) return;
      return caches.keys().then(function(keys){
        return Promise.all(keys.map(function(k){ return caches.delete(k); }));
      });
    }).catch(function(){});
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
        <script dangerouslySetInnerHTML={{ __html: swKillScript }} />
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
          <InstallAppBanner />
          <footer className="border-t border-border pb-[env(safe-area-inset-bottom)]">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-sm text-text-muted sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-6">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-text">{SITE_NAME}</span>
                <VisitorCounter />
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <a href="/feedback" className="hover:text-text">
                  Request an app
                </a>
                <span>Files stay on your device</span>
                <span>Developed by Abhishek Verma</span>
              </div>
            </div>
          </footer>
        </AppProviders>
      </body>
    </html>
  );
}
