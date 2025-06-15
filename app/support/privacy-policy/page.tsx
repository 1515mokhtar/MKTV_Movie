'use client';

import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="py-8 px-4 md:px-6 lg:px-8">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
        Privacy Policy
      </h2>
      <p className="text-lg text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
        Your privacy is paramount to us. This Privacy Policy explains how we collect, use, and disclose information about you,
        and your rights in relation to that information.
      </p>

      <div className="space-y-10">
        <section className="bg-muted p-6 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-primary mb-3">1. Information We Collect</h3>
          <p className="text-foreground leading-relaxed">
            We collect various types of information in connection with the services we provide,
            including personal information you provide directly to us (e.g., when you create an account, make a purchase, or contact customer support),
            and information collected automatically through your use of the Service (e.g., usage data, device information, and cookies).
          </p>
        </section>

        <section className="bg-muted p-6 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-primary mb-3">2. How We Use Your Information</h3>
          <p className="text-foreground leading-relaxed">
            We use the information we collect to provide, maintain, and improve our services, to develop new features,
            to personalize your experience, to communicate with you about your account and our services,
            and to detect, prevent, and address technical issues, fraud, or other illegal activities.
          </p>
        </section>

        <section className="bg-muted p-6 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-primary mb-3">3. Sharing Your Information</h3>
          <p className="text-foreground leading-relaxed">
            We may share your information with third parties in certain circumstances, such as with service providers who perform functions on our behalf,
            in connection with business transfers (e.g., mergers or acquisitions), to comply with legal obligations,
            or to protect our rights and property. We do not sell your personal information.
          </p>
        </section>

        <section className="bg-muted p-6 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-primary mb-3">4. Your Choices and Rights</h3>
          <p className="text-foreground leading-relaxed">
            You have certain choices regarding the information we collect and how it is used. This includes the ability to access,
            update, or delete your personal information, as well as to opt-out of certain data collection or marketing communications.
            You may also have additional rights depending on your jurisdiction, such as the right to data portability.
          </p>
        </section>
      </div>
    </div>
  );
} 