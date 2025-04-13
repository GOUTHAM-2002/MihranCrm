import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InsuranceDetail } from '@/lib/types';
import { insuranceDetailsApi } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface InsuranceRecordDetailProps {
  record: InsuranceDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Custom expandable text field component
function ExpandableField({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="space-y-2 border rounded-md p-3 bg-muted/5 shadow-sm">
      <div className="flex justify-between items-center">
        <FormLabel className="text-sm font-medium">{label}</FormLabel>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.preventDefault(); // Prevent form submission
            setExpanded(!expanded);
          }} 
          className="h-8 w-8 p-0"
        >
          {expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      
      {!expanded ? (
        <div className="relative">
          <div className="text-sm overflow-hidden text-muted-foreground h-6">
            {value || "No information provided"}
          </div>
          {value && value.length > 60 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background flex items-center justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={(e) => {
                  e.preventDefault(); // Prevent form submission
                  setExpanded(true);
                }}
              >
                Show More <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[120px] text-sm resize-y border-muted"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={(e) => {
                e.preventDefault(); // Prevent form submission
                setExpanded(false);
              }}
            >
              Show Less <ChevronUp className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Link display component
function LinkDisplay({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FormItem>
      <FormLabel className="text-sm font-medium">{label}</FormLabel>
      <div className="flex items-center gap-2">
        <FormControl>
          <Input 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="h-10" 
            placeholder="URL or reference to recording" 
          />
        </FormControl>
        {value && (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-primary hover:underline text-sm px-2 py-1 bg-primary/10 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Listen
          </a>
        )}
      </div>
      <FormMessage className="text-xs" />
    </FormItem>
  );
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
      annual_maximum: record?.annual_maximum || '',
      deductible: record?.deductible || '',
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
      call_duration: record?.call_duration || '',
      call_recording: record?.call_recording || '',
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
        annual_maximum: record.annual_maximum || '',
        deductible: record.deductible || '',
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
        call_duration: record.call_duration || '',
        call_recording: record.call_recording || '',
      });
    }
  }, [record, form]);
  
  // Clear error when dialog opens
  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);
  
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
  
  // Custom handler for dialog open/close
  const handleDialogOpenChange = (newOpenState: boolean) => {
    if (!newOpenState) {
      // Clear error when dialog is closing
      setError(null);
    }
    onOpenChange(newOpenState);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 bg-gradient-to-r from-primary/10 to-background sticky top-0 z-10 backdrop-blur-sm">
          <DialogTitle className="text-xl">Insurance Record Details</DialogTitle>
          <DialogDescription>
            View and edit insurance details for {record.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6">
          {error && (
            <Alert variant="destructive" className="mb-4 mt-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-4 w-full">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="insurance">Insurance</TabsTrigger>
                  <TabsTrigger value="coverage">Coverage</TabsTrigger>
                  <TabsTrigger value="call">Call Info</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="mt-2 focus:outline-none">
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-primary">Personal Information</h3>
                    <Separator className="my-2" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        rules={{ required: 'Name is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Name *</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-10" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone_number"
                        rules={{ required: 'Phone number is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Phone Number *</FormLabel>
                            <FormControl>
                              <Input type="tel" {...field} className="h-10" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="h-10" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="appointment_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Appointment Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="h-10" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="last_appointment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Last Appointment</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="h-10" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="insurance" className="mt-2 focus:outline-none">
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-primary">Insurance Details</h3>
                    <Separator className="my-2" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="insurance_company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Insurance Company</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-10" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="member_id"
                        rules={{ required: 'Member ID is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Member ID *</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-10" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="subscriber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Subscriber</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-10" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="plan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Plan</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-10" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="eligibility_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Eligibility Status</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-10" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="annual_maximum"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Annual Maximum</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-10" type="text" placeholder="e.g., $1500" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="deductible"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Deductible</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-10" type="text" placeholder="e.g., $50" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="coverage" className="mt-2 focus:outline-none">
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-primary">Coverage Details</h3>
                    <Separator className="my-2" />
                    
                    <FormField
                      control={form.control}
                      name="coverage"
                      render={({ field }) => (
                        <ExpandableField 
                          label="Coverage" 
                          value={field.value} 
                          onChange={field.onChange} 
                        />
                      )}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="coverage_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Coverage Status</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-10" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="waiting_period"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Waiting Period</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-10" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <h3 className="text-sm font-semibold text-primary mt-4">Frequency & Limitations</h3>
                    <Separator className="my-2" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="frequency_limitations"
                        render={({ field }) => (
                          <ExpandableField 
                            label="Frequency Limitations" 
                            value={field.value} 
                            onChange={field.onChange} 
                          />
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="frequency_limitations_status"
                        render={({ field }) => (
                          <ExpandableField 
                            label="Limitations Status" 
                            value={field.value} 
                            onChange={field.onChange} 
                          />
                        )}
                      />
                    </div>
                    
                    <h3 className="text-sm font-semibold text-primary mt-4">Exclusions & Additional Info</h3>
                    <Separator className="my-2" />
                    
                    <FormField
                      control={form.control}
                      name="downgrades_exclusions"
                      render={({ field }) => (
                        <ExpandableField 
                          label="Downgrades/Exclusions" 
                          value={field.value} 
                          onChange={field.onChange} 
                        />
                      )}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pre_authorization"
                        render={({ field }) => (
                          <ExpandableField 
                            label="Pre-Authorization" 
                            value={field.value} 
                            onChange={field.onChange} 
                          />
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="contact_inquiries"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Contact Info for Inquiries</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-10" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="call" className="mt-2 focus:outline-none">
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-primary">Call Information</h3>
                    <Separator className="my-2" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="called_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Call Status</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-10" placeholder="not called, call failed, call succeeded" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="call_duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Call Duration</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-10" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <h3 className="text-sm font-semibold text-primary mt-4">Call Content</h3>
                    <Separator className="my-2" />
                    
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="call_transcript"
                        render={({ field }) => (
                          <ExpandableField 
                            label="Call Transcript" 
                            value={field.value} 
                            onChange={field.onChange} 
                          />
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="call_summary"
                        render={({ field }) => (
                          <ExpandableField 
                            label="Call Summary" 
                            value={field.value} 
                            onChange={field.onChange} 
                          />
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="call_recording"
                        render={({ field }) => (
                          <LinkDisplay 
                            label="Call Recording" 
                            value={field.value} 
                            onChange={field.onChange} 
                          />
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter className="px-6 py-4 sticky bottom-0 bg-background/80 backdrop-blur-sm mt-6">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto transition-all"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 