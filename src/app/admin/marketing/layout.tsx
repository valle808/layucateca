import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketing HQ — La Yucateca',
  description: 'AI-powered marketing operations center for La Yucateca news channel. 7 specialist agents and 40 marketing skills promoting the channel across the internet.',
  keywords: ['marketing', 'La Yucateca', 'AI agents', 'SEO', 'social media', 'newsletter', 'content strategy'],
  openGraph: {
    title: 'Marketing HQ — La Yucateca News Channel',
    description: 'AI marketing team with 7 specialist agents and 40 marketing skills promoting La Yucateca across the internet.',
    type: 'website',
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
