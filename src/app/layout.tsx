import type { Metadata } from "next";
import Script from "next/script";
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
  title: "FrameLeads | Autonomous Acquisition Architecture",
  description: "Stop bleeding capital on manual outreach. Deploy an AI-driven routing infrastructure that scales volume without risking high-ticket brand safety.",
  openGraph: {
    title: "FrameLeads | Autonomous Acquisition Architecture",
    description: "The Velvet Rope Protocol for high-value deal flow.",
    url: "https://frameleads.vercel.app",
    siteName: "FrameLeads",
    images: [
      {
        url: "/hero-mockup-v2.jpg", // This will pull your high-res dashboard as the link preview
        width: 1200,
        height: 630,
        alt: "FrameLeads Architecture",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FrameLeads | Autonomous Acquisition Architecture",
    description: "The Velvet Rope Protocol for high-value deal flow.",
    creator: "@BrandFlowStudio",
    images: ["/hero-mockup-v2.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${spaceGrotesk.variable} ${oxanium.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#1A1A1A] bg-grid-overlay font-sans text-white antialiased" suppressHydrationWarning>
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
