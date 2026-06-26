import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#d4a847",
};

export const metadata: Metadata = {
  title: "HSK-4 Study System",
  description:
    "Premium HSK-4 study app with spaced repetition, quizzes, flashcards, and progress tracking",
  manifest: "/manifest.json",
  openGraph: {
    title: "HSK-4 Study System",
    description:
      "Master HSK-4 with intelligent spaced repetition, quizzes, and detailed progress analytics",
    type: "website",
    locale: "en_US",
    siteName: "HSK-4 Study",
  },
  twitter: {
    card: "summary_large_image",
    title: "HSK-4 Study System",
    description:
      "Master HSK-4 with intelligent spaced repetition and progress tracking",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSerifSC.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a
          href="#main-content"
          className="skip-link"
        >
          Skip to content
        </a>
        <div id="main-content" className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
