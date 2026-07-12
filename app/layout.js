import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter', weight: '600' });

export const metadata = {
  title: 'AI Job Risk Calculator | Will AI Take My Job?',
  description: 'Find out if AI will replace your job. Get your AI Risk Score, Protection Score, and Displacement Year based on your actual daily tasks. Research-backed by WEF, Goldman Sachs, McKinsey, and Oxford. Free.',
  keywords: 'AI job risk, will AI take my job, AI replace job, automation risk calculator, AI job displacement, future of work, AI career impact, AI protection score, when will AI replace my job',
  metadataBase: new URL('https://calculator.inspireambitions.com'),
  openGraph: {
    title: 'AI Job Risk Calculator | Will AI Take My Job?',
    description: 'Get your AI Risk Score, Protection Score, and Displacement Year. Task-level analysis backed by WEF, Goldman Sachs, and McKinsey research. Free.',
    url: 'https://calculator.inspireambitions.com',
    siteName: 'AI Job Risk Calculator',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Job Risk Calculator | Will AI Take My Job?',
    description: 'Get your AI Risk Score, Protection Score, and Displacement Year based on your actual daily tasks. Research-backed. Free.',
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
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-PY9B70N583" />
        <script
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
