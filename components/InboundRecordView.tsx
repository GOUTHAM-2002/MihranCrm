import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { InboundRecord } from '@/lib/types';
import { Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InboundRecordViewProps {
  record: InboundRecord;
}

// Revamped ExpandableField component
function ExpandableField({ 
  label, 
  value 
}: { 
  label: string; 
  value: string | null | undefined;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Determine if content is overflowing (requires "Show More")
  useEffect(() => {
    if (contentRef.current) {
      // Check scrollHeight vs clientHeight on the *specific* div containing the text
      const el = contentRef.current;
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    }
  }, [value]); // Re-check when value changes

  const displayValue = value || <span className="text-muted-foreground/80 italic">Not provided</span>;
  const Tag = typeof displayValue === 'string' ? 'div' : 'span'; // Use div for string, span for JSX

  return (
    <div className="space-y-2 rounded-md border bg-muted/30 p-3 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-foreground/90 pt-1">{label}</span>
        {/* Only show eye toggle if there's actually content to hide/show */}
        {value && (
            <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground -mt-1 -mr-1" // Adjust margins
            >
                {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
        )}
      </div>
      
      <div className="text-sm text-foreground/80 space-y-1.5">
        <Tag 
          ref={contentRef} 
          className={cn(
            "block whitespace-pre-wrap break-words", // Allow wrapping
            !isExpanded && "line-clamp-2" // Apply line clamp only when collapsed
          )}
        >
          {displayValue}
        </Tag>
        
        {/* Show More/Less button appears below content, only if overflowing */}
        {!isExpanded && isOverflowing && (
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => setIsExpanded(true)} 
            className="h-auto p-0 text-xs text-primary font-medium"
          >
            Show More <ChevronDown className="h-3 w-3 ml-0.5" />
          </Button>
        )}
        {isExpanded && isOverflowing && ( // Also need to show less if it was overflowing
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => setIsExpanded(false)} 
            className="h-auto p-0 text-xs text-primary font-medium"
          >
            Show Less <ChevronUp className="h-3 w-3 ml-0.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Static field display (similar styling to ExpandableField)
function StaticField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 rounded-md border bg-muted/30 p-3 shadow-sm min-h-[76px] flex flex-col justify-center">
      <span className="text-sm font-medium text-foreground/90">{label}</span>
      <div className="text-sm text-foreground/80">
        {children}
      </div>
    </div>
  );
}

export default function InboundRecordView({ record }: InboundRecordViewProps) {
  return (
    <Card className="shadow-none border-0 overflow-visible bg-transparent">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-4 w-full">
          <TabsTrigger value="personal" className="text-xs sm:text-sm py-1.5">Personal</TabsTrigger>
          <TabsTrigger value="appointment" className="text-xs sm:text-sm py-1.5">Appointment</TabsTrigger>
          <TabsTrigger value="insurance" className="text-xs sm:text-sm py-1.5">Insurance</TabsTrigger>
          <TabsTrigger value="call" className="text-xs sm:text-sm py-1.5">Call Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="mt-1 focus:outline-none p-1">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm font-semibold text-primary mb-2 ml-1">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              <ExpandableField label="Name" value={record.name} />
              <ExpandableField label="Phone Number" value={record.phone} />
              <ExpandableField label="Date of Birth" value={record.dob} />
              <ExpandableField label="Address" value={record.address} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="appointment" className="mt-1 focus:outline-none p-1">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm font-semibold text-primary mb-2 ml-1">Appointment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              <ExpandableField label="Appointment Number" value={record.appointment_number} />
              <ExpandableField label="Appointment Date" value={record.appointment_date} />
              <ExpandableField label="Previous Appointment Date" value={record.previous_appointment_date} />
              <ExpandableField label="Appointment Type" value={record.type} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="insurance" className="mt-1 focus:outline-none p-1">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm font-semibold text-primary mb-2 ml-1">Insurance Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              <StaticField label="Has Insurance Policy">
                {record.insurance_policy ? (
                  <span className="inline-flex items-center text-green-600 text-sm font-medium">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center text-red-600 text-sm font-medium">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    No
                  </span>
                )}
              </StaticField>
              <ExpandableField label="Insurance Name" value={record.insurance_name} />
              <ExpandableField label="Member ID" value={record.member_id} />
              <ExpandableField label="Group Number" value={record.group_number} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="call" className="mt-1 focus:outline-none p-1">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm font-semibold text-primary mb-2 ml-1">Call Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              <StaticField label="Call Status">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${ record.call_status === 'completed' ? 'bg-green-100 text-green-800' : record.call_status === 'attempted' ? 'bg-yellow-100 text-yellow-800' : record.call_status === 'not_reachable' ? 'bg-red-100 text-red-800' : record.call_status === 'canceled' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800' }`}>
                  {record.call_status || 'Not Called'}
                </span>
              </StaticField>
              <StaticField label="Call Transfer Status">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${ record.call_transfer_status === 'transferred' ? 'bg-green-100 text-green-800' : record.call_transfer_status === 'failed' ? 'bg-red-100 text-red-800' : record.call_transfer_status === 'not_required' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800' }`}>
                  {record.call_transfer_status || 'Not Transferred'}
                </span>
              </StaticField>
              <ExpandableField label="Call Transcript" value={record.transcript} />
              <ExpandableField label="Call Summary" value={record.summary} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
} 