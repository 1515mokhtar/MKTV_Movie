"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function HomeLanding() {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/10 to-background/90 px-4 py-12">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary drop-shadow-lg">{t('homeLanding.welcomeTitle')}</h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          {t('homeLanding.welcomeSubtitle')}
        </p>
        <div className="bg-card rounded-xl shadow-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-primary">{t('homeLanding.plansTitle')}</h2>
          <p className="text-base text-muted-foreground">
            <strong>{t('homeLanding.premiumPlanTitle')}</strong> {t('homeLanding.premiumPlanDescription')} <br/>
            <span className="text-mktv-accent font-bold">{t('homeLanding.premiumPlanPrice')}</span>
          </p>
        </div>
        <div className="bg-card rounded-xl shadow-lg p-6 space-y-2">
          <h2 className="text-xl font-semibold text-primary">{t('homeLanding.aboutTitle')}</h2>
          <p className="text-base text-muted-foreground">
            {t('homeLanding.aboutDescription')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/subscribe">
            <Button size="lg" className="w-48 text-lg font-semibold bg-mktv-accent hover:bg-mktv-accent-dark">
              {t('homeLanding.subscribeButton')}
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="outline" className="w-48 text-lg font-semibold">
              {t('homeLanding.watchFreeButton')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 