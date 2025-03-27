import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { insuranceDetailsApi } from '@/lib/supabase';
import { format } from 'date-fns';

type FormValues = {
  name: string;
  phone_number: string;
  member_id: string;
  insurance_company?: string;
  dob?: string;
  appointment_date?: string;
  subscriber?: string;
  plan?: string;
  eligibility_status?: string;
  coverage?: string;
  coverage_status?: string;
  annual_maximum?: string;
  deductible?: string;
  waiting_period?: string;
  frequency_limitations?: string;
  frequency_limitations_status?: string;
  downgrades_exclusions?: string;
  pre_authorization?: string;
  contact_inquiries?: string;
};

export default function AddInsuranceRecord({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      phone_number: '',
      member_id: '',
      insurance_company: '',
      dob: format(new Date(), 'yyyy-MM-dd'),
      appointment_date: format(new Date(), 'yyyy-MM-dd'),
      subscriber: '',
      plan: '',
      eligibility_status: 'Active',
      coverage: '',
      coverage_status: 'Active',
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      const formattedData = {
        ...data,
        annual_maximum: data.annual_maximum ? parseFloat(data.annual_maximum) : undefined,
        deductible: data.deductible ? parseFloat(data.deductible) : undefined,
        called_status: 'not called' as 'not called',
      };
      
      await insuranceDetailsApi.create(formattedData);
      
      form.reset();
      setOpen(false);
      onSuccess();
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add record';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default">Add New Record</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Insurance Record</DialogTitle>
            <DialogDescription>
              Enter the details for the new insurance record. Required fields are marked with *.
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
                        <FormLabel>Name *</FormLabel>
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
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" placeholder="(555) 555-5555" />
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
                        <FormLabel>Member ID *</FormLabel>
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
                            <SelectItem value="N/A">N/A</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Other Information</h3>
                  
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
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Record'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
} 