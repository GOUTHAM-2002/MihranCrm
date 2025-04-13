import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { insuranceDetailsApi } from '@/lib/supabase';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type FormValues = {
  name: string;
  phone_number: string;
  member_id: string;
  insurance_company?: string;
  dob?: string;
  appointment_date?: string;
  last_appointment?: string;
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
      last_appointment: '',
      subscriber: '',
      plan: '',
      eligibility_status: '',
      coverage: '',
      coverage_status: '',
      annual_maximum: '',
      deductible: '',
      waiting_period: '',
      frequency_limitations: '',
      frequency_limitations_status: '',
      downgrades_exclusions: '',
      pre_authorization: '',
      contact_inquiries: '',
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      const calledStatus = 'not called' as const;
      const formattedData = {
        ...data,
        called_status: calledStatus,
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
          <Button variant="default" className="gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Record
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 bg-gradient-to-r from-primary/10 to-background sticky top-0 z-10 backdrop-blur-sm">
            <DialogTitle className="text-xl">Add New Insurance Record</DialogTitle>
            <DialogDescription>
              Enter the details for the new insurance record. Required fields are marked with *.
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
                    <TabsTrigger value="more">More Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="personal" className="mt-2 focus:outline-none">
                    <div className="space-y-4">
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
                                <Input {...field} type="tel" className="h-10" placeholder="(555) 555-5555" />
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
                    <div className="space-y-4">
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
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="coverage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Coverage</FormLabel>
                              <FormControl>
                                <Textarea {...field} className="min-h-[80px] resize-y" />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
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
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="frequency_limitations"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Frequency Limitations</FormLabel>
                              <FormControl>
                                <Input {...field} className="h-10" />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="frequency_limitations_status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Frequency Limitations Status</FormLabel>
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
                  
                  <TabsContent value="more" className="mt-2 focus:outline-none">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="downgrades_exclusions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Downgrades/Exclusions</FormLabel>
                              <FormControl>
                                <Textarea {...field} className="min-h-[80px] resize-y" />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pre_authorization"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Pre-Authorization</FormLabel>
                              <FormControl>
                                <Input {...field} className="h-10" />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
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
                </Tabs>
                
                <DialogFooter className="px-6 py-4 sticky bottom-0 bg-background/80 backdrop-blur-sm mt-6">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full sm:w-auto transition-all"
                  >
                    {loading ? 'Saving...' : 'Save Record'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 