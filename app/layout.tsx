import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsProvider } from "./analytics/AnalyticsProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const socialImage = `${siteUrl.replace(/\/$/, "")}/media/operation-steel-raven-x-live-thumbnail.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Operation Steel Raven",
    template: "%s · Operation Steel Raven",
  },
  description:
    "Deploy into the Black Pines in the browser vertical slice of Operation Steel Raven.",
  openGraph: {
    title: "Operation Steel Raven",
    description: "One operative. One corridor. Play Mission 1 in your browser.",
    type: "website",
    images: [{
      url: socialImage,
      width: 1600,
      height: 900,
      alt: "Operation Steel Raven live gameplay — mountain, river and helicopter extraction",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Operation Steel Raven",
    description: "Enter the Black Pines. Play Mission 1 in your browser.",
    images: [socialImage],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AnalyticsProvider />
        {children}
      </body>
    </html>
  );
}
