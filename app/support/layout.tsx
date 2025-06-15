import React from "react";

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen py-12">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="relative z-10 container mx-auto p-4 md:px-6 lg:px-8 bg-card rounded-lg shadow-xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-8 text-center">
          Support
        </h1>
        <div className="border-t border-border pt-8">
          {children}
        </div>
      </div>
    </div>
  );
} 