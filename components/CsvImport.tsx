import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CSVRecord } from '@/lib/types';
import { insuranceDetailsApi } from '@/lib/supabase';
import { format } from 'date-fns';

export default function CsvImport({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedData = results.data as CSVRecord[];
          
          // Validate required fields - name, phone_number, and member_id are required
          const invalidRecords = parsedData.filter(record => !record.name || !record.phone_number || !record.member_id);
          
          if (invalidRecords.length > 0) {
            setError(`Found ${invalidRecords.length} records missing required fields (name, phone number, or member ID)`);
            setLoading(false);
            return;
          }
          
          // Format data for insertion
          const formattedData = parsedData.map(record => ({
            ...record,
            called_status: 'not called' as 'not called',
            // Set today's date as default for appointment_date and dob if not provided
            appointment_date: record.appointment_date || format(new Date(), 'yyyy-MM-dd'),
            dob: record.dob || format(new Date(), 'yyyy-MM-dd'),
            last_appointment: record.last_appointment || '',
            annual_maximum: record.annual_maximum ? parseFloat(record.annual_maximum) : undefined,
            deductible: record.deductible ? parseFloat(record.deductible) : undefined,
          }));
          
          // Insert data into Supabase
          await insuranceDetailsApi.bulkInsert(formattedData);
          
          setSuccess(`Successfully imported ${parsedData.length} records`);
          onSuccess();
        } catch (err: Error | unknown) {
          setError(err instanceof Error ? err.message : 'Failed to import data');
        } finally {
          setLoading(false);
          // Clear the input
          e.target.value = '';
        }
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
        setLoading(false);
        // Clear the input
        e.target.value = '';
      }
    });
  };

  return (
    <div className="space-y-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            Import CSV
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h3 className="font-medium">Import Insurance Records</h3>
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with insurance records. Required fields: name, phone_number, member_id.
            </p>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </div>
        </PopoverContent>
      </Popover>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 