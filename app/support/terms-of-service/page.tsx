'use client';

import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="py-8 px-4 md:px-6 lg:px-8">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
        Terms of Service
      </h2>
      <p className="text-lg text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
        Please read these Terms of Service carefully before using our service.
        By accessing or using the Service, you agree to be bound by these Terms.
      </p>

      <div className="space-y-10">
        <section className="bg-muted p-6 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-primary mb-3">1. Acceptance of Terms</h3>
          <p className="text-foreground leading-relaxed">
            By accessing or using the MKTV service (the "Service"), you signify that you have read,
            understood, and agree to be bound by these Terms of Service ("Terms"), whether or not you are a registered member of the Service.
            If you do not agree to these Terms, do not use the Service.
          </p>
        </section>

        <section className="bg-muted p-6 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-primary mb-3">2. User Conduct</h3>
          <p className="text-foreground leading-relaxed">
            You agree to use the Service only for lawful purposes and in a way that does not infringe the rights of,
            restrict, or inhibit anyone else's use and enjoyment of the Service. Prohibited behavior includes harassing or causing distress or inconvenience to any other user,
            transmitting obscene or offensive content, or disrupting the normal flow of dialogue within the Service.
          </p>
        </section>

        <section className="bg-muted p-6 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-primary mb-3">3. Intellectual Property</h3>
          <p className="text-foreground leading-relaxed">
            All content and materials available on the Service, including, but not limited to, text, graphics, website name, code, images,
            and logos are the intellectual property of MKTV or its licensors and are protected by applicable copyright and trademark law.
            Any inappropriate use, including but not limited to the reproduction, distribution, display, or transmission of any content on this site is strictly prohibited,
            unless specifically authorized by MKTV.
          </p>
        </section>

        <section className="bg-muted p-6 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-primary mb-3">4. Termination</h3>
          <p className="text-foreground leading-relaxed">
            We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever,
            including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
            If you wish to terminate your account, you may simply discontinue using the Service.
          </p>
        </section>
      </div>
    </div>
  );
} 