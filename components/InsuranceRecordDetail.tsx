import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InsuranceDetail } from '@/lib/types';
import { insuranceDetailsApi } from '@/lib/supabase';

interface InsuranceRecordDetailProps {
  record: InsuranceDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function InsuranceRecordDetail({ record, open, onOpenChange, onSuccess }: InsuranceRecordDetailProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm({
    defaultValues: {
      name: record?.name || '',
      phone_number: record?.phone_number || '',
      appointment_date: record?.appointment_date ? record.appointment_date.substring(0, 10) : '',
      last_appointment: record?.last_appointment ? record.last_appointment.substring(0, 10) : '',
      insurance_company: record?.insurance_company || '',
      dob: record?.dob ? record.dob.substring(0, 10) : '',
      member_id: record?.member_id || '',
      subscriber: record?.subscriber || '',
      plan: record?.plan || '',
      eligibility_status: record?.eligibility_status || '',
      annual_maximum: record?.annual_maximum?.toString() || '',
      deductible: record?.deductible?.toString() || '',
      coverage: record?.coverage || '',
      coverage_status: record?.coverage_status || '',
      waiting_period: record?.waiting_period || '',
      frequency_limitations: record?.frequency_limitations || '',
      frequency_limitations_status: record?.frequency_limitations_status || '',
      downgrades_exclusions: record?.downgrades_exclusions || '',
      pre_authorization: record?.pre_authorization || '',
      contact_inquiries: record?.contact_inquiries || '',
      called_status: record?.called_status || 'not called',
      call_transcript: record?.call_transcript || '',
      call_summary: record?.call_summary || '',
    }
  });
  
  // Update form when record changes
  useEffect(() => {
    if (record) {
      form.reset({
        name: record.name || '',
        phone_number: record.phone_number || '',
        appointment_date: record.appointment_date ? record.appointment_date.substring(0, 10) : '',
        last_appointment: record.last_appointment ? record.last_appointment.substring(0, 10) : '',
        insurance_company: record.insurance_company || '',
        dob: record.dob ? record.dob.substring(0, 10) : '',
        member_id: record.member_id || '',
        subscriber: record.subscriber || '',
        plan: record.plan || '',
        eligibility_status: record.eligibility_status || '',
        annual_maximum: record.annual_maximum?.toString() || '',
        deductible: record.deductible?.toString() || '',
        coverage: record.coverage || '',
        coverage_status: record.coverage_status || '',
        waiting_period: record.waiting_period || '',
        frequency_limitations: record.frequency_limitations || '',
        frequency_limitations_status: record.frequency_limitations_status || '',
        downgrades_exclusions: record.downgrades_exclusions || '',
        pre_authorization: record.pre_authorization || '',
        contact_inquiries: record.contact_inquiries || '',
        called_status: record.called_status || 'not called',
        call_transcript: record.call_transcript || '',
        call_summary: record.call_summary || '',
      });
    }
  }, [record, form]);
  
  const onSubmit = async (data: Record<string, string | number | null>) => {
    if (!record?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (!data.name || !data.phone_number || !data.member_id) {
        throw new Error('Name, phone number, and member ID are required');
      }
      
      const formattedData = {
        ...data,
        annual_maximum: data.annual_maximum ? parseFloat(data.annual_maximum as string) : undefined,
        deductible: data.deductible ? parseFloat(data.deductible as string) : undefined,
        called_status: data.called_status as 'not called' | 'call failed' | 'call succeeded',
      };
      
      await insuranceDetailsApi.update(record.id, formattedData);
      
      onSuccess();
      onOpenChange(false);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update record');
    } finally {
      setLoading(false);
    }
  };
  
  if (!record) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Insurance Record Details</DialogTitle>
          <DialogDescription>
            View and edit insurance details for {record.name}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Personal Information</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: 'Name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone_number"
                  rules={{ required: 'Phone number is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="appointment_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appointment Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="last_appointment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Appointment</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Insurance Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Insurance Information</h3>
                
                <FormField
                  control={form.control}
                  name="insurance_company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Company</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="member_id"
                  rules={{ required: 'Member ID is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subscriber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscriber</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plan Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Plan Details</h3>
                
                <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="eligibility_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eligibility Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="annual_maximum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Maximum</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="deductible"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deductible</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Coverage Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Coverage Details</h3>
                
                <FormField
                  control={form.control}
                  name="coverage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coverage</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="coverage_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coverage Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="waiting_period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waiting Period</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Additional Details</h3>
                
                <FormField
                  control={form.control}
                  name="frequency_limitations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency Limitations</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="frequency_limitations_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency Limitations Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="N/A">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="downgrades_exclusions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Downgrades/Exclusions</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Other Information</h3>
                
                <FormField
                  control={form.control}
                  name="pre_authorization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pre-Authorization</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contact_inquiries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Info for Inquiries</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="called_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not called">Not Called</SelectItem>
                          <SelectItem value="call failed">Call Failed</SelectItem>
                          <SelectItem value="call succeeded">Call Succeeded</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Call Information</h3>
              
              <FormField
                control={form.control}
                name="call_transcript"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call Transcript</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="call_summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call Summary</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 