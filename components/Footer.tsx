import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm" style={{ fontFamily: 'var(--font-header)' }}>M</span>
              </div>
              <span className="text-lg font-bold text-primary" style={{ fontFamily: 'var(--font-header)' }}>
                Mirai Minds
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} Mirai Minds. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/login" className="hover:text-primary transition-colors">
              Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
