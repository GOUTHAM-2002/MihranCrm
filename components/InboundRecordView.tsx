import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { InboundRecord } from '@/lib/types';
import { Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

interface InboundRecordViewProps {
  record: InboundRecord;
}

// Custom expandable text field component
function ExpandableField({ 
  label, 
  value 
}: { 
  label: string; 
  value: string | null | undefined;
}) {
  const [expanded, setExpanded] = useState(false);
  
  // If value is null or undefined, show "Not provided"
  const displayValue = value || "Not provided";
  
  return (
    <div className="space-y-2 border rounded-md p-3 bg-muted/5 shadow-sm">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => setExpanded(!expanded)} 
          className="h-8 w-8 p-0"
        >
          {expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      
      {!expanded ? (
        <div className="relative">
          <div className="text-sm overflow-hidden text-muted-foreground h-6">
            {displayValue}
          </div>
          {displayValue.length > 60 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background flex items-center justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setExpanded(true)}
              >
                Show More <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm whitespace-pre-wrap">{displayValue}</div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setExpanded(false)}
            >
              Show Less <ChevronUp className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InboundRecordView({ record }: InboundRecordViewProps) {
  return (
    <Card className="shadow-lg border-t-4 border-t-primary overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-background pb-4">
        <CardTitle className="text-primary/90 text-xl">Inbound Record Details</CardTitle>
        <CardDescription>
          View all details for this inbound record
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-4 w-full">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="appointment">Appointment</TabsTrigger>
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
            <TabsTrigger value="call">Call Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="mt-2 focus:outline-none">
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-primary">Personal Information</h3>
              <Separator className="my-2" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ExpandableField label="Name" value={record.name} />
                <ExpandableField label="Phone Number" value={record.phone} />
                <ExpandableField label="Date of Birth" value={record.dob} />
                <ExpandableField label="Address" value={record.address} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="appointment" className="mt-2 focus:outline-none">
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-primary">Appointment Details</h3>
              <Separator className="my-2" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ExpandableField label="Appointment Number" value={record.appointment_number} />
                <ExpandableField label="Appointment Date" value={record.appointment_date} />
                <ExpandableField label="Previous Appointment Date" value={record.previous_appointment_date} />
                <ExpandableField label="Appointment Type" value={record.type} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="insurance" className="mt-2 focus:outline-none">
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-primary">Insurance Information</h3>
              <Separator className="my-2" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 border rounded-md p-3 bg-muted/5 shadow-sm">
                  <span className="text-sm font-medium">Has Insurance Policy</span>
                  <div className="flex items-center">
                    {record.insurance_policy ? (
                      <span className="inline-flex items-center text-green-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        No
                      </span>
                    )}
                  </div>
                </div>
                
                <ExpandableField label="Insurance Name" value={record.insurance_name} />
                <ExpandableField label="Member ID" value={record.member_id} />
                <ExpandableField label="Group Number" value={record.group_number} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="call" className="mt-2 focus:outline-none">
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-primary">Call Information</h3>
              <Separator className="my-2" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 border rounded-md p-3 bg-muted/5 shadow-sm">
                  <span className="text-sm font-medium">Call Status</span>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      record.call_status === 'completed' ? 'bg-green-100 text-green-800' : 
                      record.call_status === 'attempted' ? 'bg-yellow-100 text-yellow-800' : 
                      record.call_status === 'not_reachable' ? 'bg-red-100 text-red-800' : 
                      record.call_status === 'canceled' ? 'bg-gray-100 text-gray-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {record.call_status || 'Not Called'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 border rounded-md p-3 bg-muted/5 shadow-sm">
                  <span className="text-sm font-medium">Call Transfer Status</span>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      record.call_transfer_status === 'transferred' ? 'bg-green-100 text-green-800' : 
                      record.call_transfer_status === 'failed' ? 'bg-red-100 text-red-800' : 
                      record.call_transfer_status === 'not_required' ? 'bg-gray-100 text-gray-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {record.call_transfer_status || 'Not Transferred'}
                    </span>
                  </div>
                </div>
                
                <ExpandableField label="Call Transcript" value={record.transcript} />
                <ExpandableField label="Call Summary" value={record.summary} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 