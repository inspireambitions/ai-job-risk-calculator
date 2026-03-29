import './globals.css';

export const metadata = {
  title: 'AI Job Risk Calculator | Will AI Take My Job?',
  description: 'Find out if AI will replace your job. Get a personalised AI risk score based on your actual daily tasks, not just your job title. Free AI job displacement calculator.',
  keywords: 'AI job risk, will AI take my job, AI replace job, automation risk calculator, AI job displacement, future of work, AI career impact',
  metadataBase: new URL('https://ai-job-risk-calculator.vercel.app'),
  openGraph: {
    title: 'AI Job Risk Calculator | Will AI Take My Job?',
    description: 'Get your personalised AI displacement risk score. Analyse your actual tasks, not just your job title. Free tool by InspireAmbitions.com.',
    url: 'https://ai-job-risk-calculator.vercel.app',
    siteName: 'AI Job Risk Calculator',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Job Risk Calculator | Will AI Take My Job?',
    description: 'Get your personalised AI displacement risk score based on your actual daily tasks. Not a generic score.',
    creator: '@InspireAmbition',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://ai-job-risk-calculator.vercel.app',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
