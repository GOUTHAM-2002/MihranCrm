"use client";

import InsuranceTable from '@/components/InsuranceTable';
import { Toaster } from '@/components/ui/sonner';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container py-8 mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mb-2">
            Insurance CRM Dashboard
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Manage your patient insurance details, appointments, and coverage information in one place.
          </p>
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
