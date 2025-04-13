"use client";

import InboundTable from '@/components/InboundTable';
import { Toaster } from '@/components/ui/sonner';

export default function InboundPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 dark:from-background dark:to-background">
      <div className="container py-8 mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mb-2">
            Inbound Management
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Track and manage all inbound appointments and requests.
          </p>
        </header>
        
        <InboundTable />
        
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Insurance CRM. All rights reserved.</p>
        </footer>
      </div>
      <Toaster />
    </main>
  );
} 