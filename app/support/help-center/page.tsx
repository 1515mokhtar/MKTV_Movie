'use client';

import React from 'react';

export default function HelpCenterPage() {
  return (
    <div className="py-8 px-4 md:px-6 lg:px-8">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
        Help Center
      </h2>
      <p className="text-lg text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
        Welcome to the Help Center. Here you can find answers to common questions and get support.
      </p>

      <div className="space-y-10">
        <section className="bg-muted p-6 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-primary mb-3">Getting Started</h3>
          <p className="text-foreground leading-relaxed">
            Discover how to easily sign up, log in, and dive into your favorite movies and TV series.
            Our step-by-step guides will help you get set up in no time, ensuring a smooth start to your streaming journey.
          </p>
        </section>

        <section className="bg-muted p-6 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-primary mb-3">Troubleshooting Common Issues</h3>
          <p className="text-foreground leading-relaxed">
            Encountering a problem? Our troubleshooting section provides solutions for common issues
            like video playback errors, account access difficulties, and connectivity problems.
            Find quick fixes and tips to get back to watching without interruption.
          </p>
        </section>

        <section className="bg-muted p-6 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-primary mb-3">Contact Support</h3>
          <p className="text-foreground leading-relaxed">
            If you can't find the answer you're looking for, our dedicated support team is here to help.
            Reach out to us through our contact form for personalized assistance with any questions or concerns you may have.
          </p>
        </section>
      </div>
    </div>
  );
} 