import './globals.css';
import Script from 'next/script';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter', weight: '600' });

const applicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI Job Risk Calculator',
  url: 'https://calculator.inspireambitions.com/',
  description: 'A free task-based calculator that estimates AI displacement risk and career protection options.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'AED' },
  author: { '@type': 'Person', name: 'Kim Kiyingi', jobTitle: 'HR Career Specialist', url: 'https://inspireambitions.com/about/' },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://inspireambitions.com/' },
    { '@type': 'ListItem', position: 2, name: 'Career Tools', item: 'https://inspireambitions.com/career-tools/' },
    { '@type': 'ListItem', position: 3, name: 'AI Job Risk Calculator', item: 'https://calculator.inspireambitions.com/' },
  ],
};

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
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
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
        {posthogKey && (
          <Script
            id="posthog-analytics"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split('.');2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement('script')).type='text/javascript',p.async=!0,p.src=s.api_host.replace('.i.posthog.com','-assets.i.posthog.com')+'/static/array.js',(r=t.getElementsByTagName('script')[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a='posthog',u.people=u.people||[],u.toString=function(t){var e='posthog';return'posthog'!==a&&(e+='.'+a),t||(e+=' (stub)'),e},u.people.toString=function(){return u.toString(1)+'.people (stub)'},o='capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset'.split(' '),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init(${JSON.stringify(posthogKey)},{api_host:${JSON.stringify(posthogHost)},person_profiles:'identified_only',capture_pageview:true,capture_pageleave:true});`,
            }}
          />
        )}
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
