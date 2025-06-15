'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function HelpCenterPage() {
  const { t } = useTranslation('common');
  return (
    <div className="py-8 px-4 md:px-6 lg:px-8">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
        {t('supportPages.helpCenter.title')}
      </h2>
      <p className="text-lg text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
        {t('supportPages.helpCenter.description')}
      </p>

      <div className="space-y-10">
        <section className="bg-muted p-6 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-primary mb-3">{t('supportPages.helpCenter.gettingStartedTitle')}</h3>
          <p className="text-foreground leading-relaxed">
            {t('supportPages.helpCenter.gettingStartedContent')}
          </p>
        </section>

        <section className="bg-muted p-6 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-primary mb-3">{t('supportPages.helpCenter.troubleshootingTitle')}</h3>
          <p className="text-foreground leading-relaxed">
            {t('supportPages.helpCenter.troubleshootingContent')}
          </p>
        </section>

        <section className="bg-muted p-6 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-primary mb-3">{t('supportPages.helpCenter.contactSupportTitle')}</h3>
          <p className="text-foreground leading-relaxed">
            {t('supportPages.helpCenter.contactSupportContent')}
          </p>
        </section>
      </div>
    </div>
  );
} 