import type { Metadata } from 'next'
import { Cabin } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const cabin = Cabin({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cabin',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DevisTerrazzo — Obtenez des devis pour votre sol en terrazzo coulé',
  description:
    'Comparez gratuitement les devis de spécialistes du terrazzo coulé près de chez vous. Artisans certifiés, réponse rapide, sans engagement.',
  keywords: 'terrazzo coulé, devis terrazzo, artisan terrazzo, sol terrazzo France',
  openGraph: {
    title: 'DevisTerrazzo — Devis gratuit sol terrazzo coulé',
    description: 'Comparez les meilleurs artisans terrazzo de France en 48h.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={cabin.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-white text-primary-900 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'var(--font-cabin), sans-serif',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  )
}
