import type { Metadata } from 'next'
import { Nunito, Open_Sans } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
  weight: ['400', '600'],
})

export const metadata: Metadata = {
  title: 'Mirai Minds LMS',
  description: 'Learning Management System by Mirai Minds',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${openSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
