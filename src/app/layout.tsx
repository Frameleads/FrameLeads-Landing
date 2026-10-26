import type { Metadata } from "next";
import FirstPartyMeasurement from '../components/FirstPartyMeasurement';
import PrivacyChoices from '../components/PrivacyChoices';
import localFont from "next/font/local";
import "./globals.css";

const spaceGrotesk = localFont({
  src: "../../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2",
  weight: "300 700",
  style: "normal",
  display: "swap",
  variable: "--font-space-grotesk",
});

const oxanium = localFont({
  src: "../../node_modules/@fontsource-variable/oxanium/files/oxanium-latin-wght-normal.woff2",
  weight: "200 800",
  style: "normal",
  display: "swap",
  variable: "--font-oxanium",
});

const jetbrainsMono = localFont({
  src: "../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
  weight: "100 800",
  style: "normal",
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://frameleads.io"),
  applicationName: "FrameLeads",
  title: "FrameLeads | Revenue Decision Intelligence for Outbound",
  description: "FrameLeads understands prospect replies, applies your sales rules, and decides what should happen next — automate, approve, escalate, or route.",
  alternates: { canonical: "https://frameleads.io/" },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "FrameLeads | Revenue Decision Intelligence for Outbound",
    description: "FrameLeads understands prospect replies, applies your sales rules, and decides what should happen next — automate, approve, escalate, or route.",
    url: "https://frameleads.io/",
    siteName: "FrameLeads",
    images: [
      {
        url: "/hero-mockup-v2.png",
        width: 1920,
        height: 1080,
        alt: "FrameLeads revenue decision intelligence platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FrameLeads | Revenue Decision Intelligence for Outbound",
    description: "FrameLeads understands prospect replies, applies your sales rules, and decides what should happen next — automate, approve, escalate, or route.",
    creator: "@BrandFlowStudio",
    images: ["/hero-mockup-v2.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${spaceGrotesk.variable} ${oxanium.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen max-w-[100vw] overflow-x-hidden bg-[#1A1A1A] bg-grid-overlay font-sans text-white antialiased" suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://frameleads.io/#organization",
            name: "FrameLeads",
            url: "https://frameleads.io/",
            description: "FrameLeads is a B2B revenue decision intelligence platform for outbound sales teams. It understands prospect replies, applies company sales rules, and determines the next revenue action.",
            logo: { "@type": "ImageObject", url: "https://frameleads.io/logo.png", width: 2000, height: 2000 },
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://frameleads.io/#website",
            url: "https://frameleads.io/",
            name: "FrameLeads",
            publisher: { "@id": "https://frameleads.io/#organization" },
          },
        ]) }} />
        <FirstPartyMeasurement />
        {children}
        <PrivacyChoices />
      </body>
    </html>
  );
}
