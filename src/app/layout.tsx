import type { Metadata } from "next";
import Script from "next/script";
import FirstPartyMeasurement from '../components/FirstPartyMeasurement';
import { Space_Grotesk, Oxanium, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-space-grotesk" 
});

const oxanium = Oxanium({ 
  subsets: ["latin"], 
  variable: "--font-oxanium" 
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-jetbrains-mono" 
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
        <Script
          id="whop-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");whop.setScope("biz_RSQW7xARXYAQke");whop.track("page");`,
          }}
        />
      </body>
    </html>
  );
}
