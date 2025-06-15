'use client'

import { Facebook, Instagram, Twitter } from "lucide-react"
import Link from "next/link"
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation('common');
  return (
    <footer className="w-full border-t bg-card">
      <div className="container grid gap-8 py-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-lg font-bold">MKTV</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Stream your favorite movies and TV shows anytime, anywhere.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">{t('footer.quickLinks')}</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/movies/disponible" className="text-muted-foreground hover:text-foreground">
                {t('footer.movies')}
              </Link>
            </li>
            <li>
              <Link href="/series/seriesdisponible" className="text-muted-foreground hover:text-foreground">
                {t('footer.tvSeries')}
              </Link>
            </li>
            <li>
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                {t('footer.newReleases')}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/support/help-center" className="text-muted-foreground hover:text-foreground">
                {t('footer.helpCenter')}
              </Link>
            </li>
            <li>
              <Link href="/support/terms-of-service" className="text-muted-foreground hover:text-foreground">
                {t('footer.termsOfService')}
              </Link>
            </li>
            <li>
              <Link href="/support/privacy-policy" className="text-muted-foreground hover:text-foreground">
                {t('footer.privacyPolicy')}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">{t('footer.connectWithUs')}</h4>
          <div className="flex gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Instagram className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-4 text-center text-sm text-muted-foreground">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  )
}

