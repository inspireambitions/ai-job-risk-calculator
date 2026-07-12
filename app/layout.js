import './globals.css';
import Script from 'next/script';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter', weight: '600' });

export const metadata = {
  title: 'AI Job Risk Calculator | Will AI Take My Job?',
  description: 'Find out how AI may change your work. Get an AI Risk Score, Protection Score, and displacement range based on your actual daily tasks, informed by published research. Free.',
  keywords: 'AI job risk, will AI take my job, AI replace job, automation risk calculator, AI job displacement, future of work, AI career impact, AI protection score, when will AI replace my job',
  metadataBase: new URL('https://calculator.inspireambitions.com'),
  openGraph: {
    title: 'AI Job Risk Calculator | Will AI Take My Job?',
    description: 'Get an AI Risk Score, Protection Score, and displacement range. Task-level analysis informed by published research. Free.',
    url: 'https://calculator.inspireambitions.com',
    siteName: 'AI Job Risk Calculator',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Job Risk Calculator | Will AI Take My Job?',
    description: 'Get an AI Risk Score, Protection Score, and displacement range based on your actual daily tasks. Informed by published research. Free.',
    creator: '@InspireAmbition',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://calculator.inspireambitions.com',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ia-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})();`,
          }}
        />
        <Script strategy="lazyOnload" src="https://www.googletagmanager.com/gtag/js?id=G-PY9B70N583" />
        <Script
          id="google-analytics"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-PY9B70N583');
            `,
          }}
        />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
