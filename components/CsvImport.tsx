import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CSVRecord } from '@/lib/types';
import { insuranceDetailsApi } from '@/lib/supabase';
import { format } from 'date-fns';

interface RawCSVRecord {
  name: string;
  phone_number: string;
  member_id: string;
  appointment_date?: string;
  last_appointment?: string;
  insurance_company?: string;
  dob?: string;
  subscriber?: string;
  plan?: string;
  eligibility_status?: string;
  annual_maximum?: string;
  deductible?: string;
  coverage?: string;
  coverage_status?: string;
  waiting_period?: string;
  frequency_limitations?: string;
  frequency_limitations_status?: string;
  downgrades_exclusions?: string;
  pre_authorization?: string;
  contact_inquiries?: string;
}

export default function CsvImport({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  const processFile = async (file: File) => {
    setLoading(true);
    setError(null);
    
    Papa.parse<RawCSVRecord>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: async (results) => {
        try {
          if (results.errors.length > 0) {
            throw new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`);
          }
          
          if (results.data.length === 0) {
            throw new Error('No data found in CSV file');
          }
          
          // Transform and validate the data
          const validRecords: CSVRecord[] = results.data
            .filter(record => record.name && record.phone_number && record.member_id)
            .map(record => {
              // Format dates if they exist
              let formattedDob = record.dob;
              let formattedAppointmentDate = record.appointment_date;
              let formattedLastAppointment = record.last_appointment;
              
              try {
                // Format dates to ISO strings if they are valid dates
                if (record.dob) {
                  const date = new Date(record.dob);
                  if (!isNaN(date.getTime())) {
                    formattedDob = format(date, 'yyyy-MM-dd');
                  }
                }
                
                if (record.appointment_date) {
                  const date = new Date(record.appointment_date);
                  if (!isNaN(date.getTime())) {
                    formattedAppointmentDate = format(date, 'yyyy-MM-dd');
                  }
                }
                
                if (record.last_appointment) {
                  const date = new Date(record.last_appointment);
                  if (!isNaN(date.getTime())) {
                    formattedLastAppointment = format(date, 'yyyy-MM-dd');
                  }
                }
              } catch (error) {
                console.warn('Error formatting date:', error);
              }
              
              // Set default called_status
              const calledStatus = 'not called' as const;
              
              return {
                name: record.name,
                phone_number: record.phone_number,
                member_id: record.member_id,
                dob: formattedDob,
                appointment_date: formattedAppointmentDate,
                last_appointment: formattedLastAppointment,
                insurance_company: record.insurance_company,
                subscriber: record.subscriber,
                plan: record.plan,
                eligibility_status: record.eligibility_status,
                annual_maximum: record.annual_maximum,
                deductible: record.deductible,
                coverage: record.coverage,
                coverage_status: record.coverage_status,
                waiting_period: record.waiting_period,
                frequency_limitations: record.frequency_limitations,
                frequency_limitations_status: record.frequency_limitations_status,
                downgrades_exclusions: record.downgrades_exclusions,
                pre_authorization: record.pre_authorization,
                contact_inquiries: record.contact_inquiries,
                called_status: calledStatus,
              };
            });
          
          if (validRecords.length === 0) {
            throw new Error('No valid records found. Each record must have a name, phone number, and member ID.');
          }
          
          // Import the data
          await insuranceDetailsApi.bulkInsert(validRecords);
          
          // Close the popover and call onSuccess
          setPopoverOpen(false);
          onSuccess();
        } catch (err: Error | unknown) {
          setError(err instanceof Error ? err.message : 'Failed to import CSV file');
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        setError(`Failed to parse CSV file: ${error.message}`);
        setLoading(false);
      }
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please select a valid CSV file');
      return;
    }
    
    processFile(file);
  };
  
  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M12 18v-6"></path>
            <path d="M8 12h8"></path>
          </svg>
          Import CSV
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="font-medium text-base">Import Records</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upload a CSV file with patient insurance records
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">CSV File</label>
              <Input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                disabled={loading}
                className="text-sm"
              />
            </div>
            
            <div className="rounded-md border p-3 bg-muted/30">
              <h4 className="text-xs font-medium mb-1">Required fields:</h4>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                <li>name</li>
                <li>phone_number</li>
                <li>member_id</li>
              </ul>
            </div>
          </div>
          
          {loading ? (
            <div className="py-2 flex items-center justify-center">
              <div className="animate-spin h-5 w-5 rounded-full border-2 border-primary border-t-transparent"></div>
              <span className="ml-2 text-sm">Importing data...</span>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button 
                size="sm" 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.csv';
                  input.onchange = (e) => {
                    if (e.target instanceof HTMLInputElement) {
                      handleFileChange({ target: e.target } as React.ChangeEvent<HTMLInputElement>);
                    }
                  };
                  input.click();
                }}
              >
                Select File
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
} 