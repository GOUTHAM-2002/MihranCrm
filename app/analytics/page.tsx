"use client";

import Analytics from '@/components/Analytics';
import { Toaster } from '@/components/ui/sonner';

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 dark:from-background dark:to-background">
      <div className="container py-8 mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            View insights and analytics about your insurance records.
          </p>
        </header>
        
        <Analytics />
        
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Insurance CRM. All rights reserved.</p>
        </footer>
      </div>
      <Toaster />
    </main>
  );
} 