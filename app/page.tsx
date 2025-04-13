"use client";

import InsuranceTable from '@/components/InsuranceTable';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 dark:from-background dark:to-background">
      <div className="container py-8 mx-auto px-4">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mb-2">
              Insurance CRM Dashboard
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Manage your patient insurance details, appointments, and coverage information in one place.
            </p>
          </div>
          <ThemeToggle />
        </header>
        
        <InsuranceTable />
        
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Insurance CRM. All rights reserved.</p>
        </footer>
      </div>
      <Toaster />
    </main>
  );
}
