import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { InboundRecord } from '@/lib/types';
import { inboundApi } from '@/lib/supabase';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InboundRecordView from './InboundRecordView';

interface InboundRecordDetailProps {
  record: InboundRecord;
  onUpdate: () => void;
}

export default function InboundRecordDetail({ record, onUpdate }: InboundRecordDetailProps) {
  const [formData, setFormData] = useState<Partial<InboundRecord>>({
    name: record.name || '',
    appointment_number: record.appointment_number,
    appointment_date: record.appointment_date,
    previous_appointment_date: record.previous_appointment_date || '',
    type: record.type,
    dob: record.dob,
    phone: record.phone,
    address: record.address,
    insurance_policy: record.insurance_policy,
    insurance_name: record.insurance_name || '',
    member_id: record.member_id || '',
    group_number: record.group_number || '',
    call_status: record.call_status || 'not_called',
    call_transfer_status: record.call_transfer_status || 'not_transferred',
    transcript: record.transcript || '',
    summary: record.summary || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('view');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await inboundApi.update(record.id, formData);
      onUpdate();
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <DialogHeader className="mb-2 sm:mb-4">
        <DialogTitle className="text-lg">Inbound Record</DialogTitle>
        <DialogDescription className="text-sm opacity-80">
          View and edit details for this appointment record
        </DialogDescription>
      </DialogHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="view" className="text-sm py-1.5 sm:py-2">View</TabsTrigger>
          <TabsTrigger value="edit" className="text-sm py-1.5 sm:py-2">Edit</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="mt-3 sm:mt-4 px-0">
          <InboundRecordView record={record} />
        </TabsContent>
        
        <TabsContent value="edit" className="mt-3 sm:mt-4">
          {error && (
            <div className="mb-3 p-2 sm:p-3 bg-red-50 text-red-800 rounded-md text-xs sm:text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 h-10 sm:h-9"
                  />
                </div>
                
                <div>
                  <Label htmlFor="appointment_number" className="text-sm">Appointment Number</Label>
                  <Input
                    id="appointment_number"
                    name="appointment_number"
                    value={formData.appointment_number}
                    onChange={handleInputChange}
                    required
                    className="mt-1 h-10 sm:h-9"
                  />
                </div>
                
                <div>
                  <Label htmlFor="appointment_date" className="text-sm">Appointment Date</Label>
                  <Input
                    id="appointment_date"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleInputChange}
                    required
                    className="mt-1 h-10 sm:h-9"
                  />
                </div>
                
                <div>
                  <Label htmlFor="previous_appointment_date" className="text-sm">Previous Appointment Date</Label>
                  <Input
                    id="previous_appointment_date"
                    name="previous_appointment_date"
                    value={formData.previous_appointment_date}
                    onChange={handleInputChange}
                    className="mt-1 h-10 sm:h-9"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type" className="text-sm">Appointment Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger className="mt-1 h-10 sm:h-9">
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Returning">Returning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="dob" className="text-sm">Date of Birth</Label>
                  <Input
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                    className="mt-1 h-10 sm:h-9"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1 h-10 sm:h-9"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address" className="text-sm">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="mt-1 min-h-[80px] sm:min-h-[80px] text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id="insurance_policy"
                    checked={formData.insurance_policy}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('insurance_policy', checked as boolean)
                    }
                  />
                  <Label htmlFor="insurance_policy" className="text-sm font-normal">Has Insurance Policy</Label>
                </div>
                
                <div className={!formData.insurance_policy ? 'opacity-50 pointer-events-none' : ''}>
                  <Label htmlFor="insurance_name" className="text-sm">Insurance Name</Label>
                  <Input
                    id="insurance_name"
                    name="insurance_name"
                    value={formData.insurance_name}
                    onChange={handleInputChange}
                    disabled={!formData.insurance_policy}
                    className="mt-1 h-10 sm:h-9"
                  />
                </div>
                
                <div className={!formData.insurance_policy ? 'opacity-50 pointer-events-none' : ''}>
                  <Label htmlFor="member_id" className="text-sm">Member ID</Label>
                  <Input
                    id="member_id"
                    name="member_id"
                    value={formData.member_id}
                    onChange={handleInputChange}
                    disabled={!formData.insurance_policy}
                    className="mt-1 h-10 sm:h-9"
                  />
                </div>
                
                <div className={!formData.insurance_policy ? 'opacity-50 pointer-events-none' : ''}>
                  <Label htmlFor="group_number" className="text-sm">Group Number</Label>
                  <Input
                    id="group_number"
                    name="group_number"
                    value={formData.group_number}
                    onChange={handleInputChange}
                    disabled={!formData.insurance_policy}
                    className="mt-1 h-10 sm:h-9"
                  />
                </div>
                
                <div className="pt-1">
                  <Label htmlFor="call_status" className="text-sm">Call Status</Label>
                  <Select
                    value={formData.call_status || 'not_called'}
                    onValueChange={(value) => handleSelectChange('call_status', value)}
                  >
                    <SelectTrigger className="mt-1 h-10 sm:h-9">
                      <SelectValue placeholder="Select call status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_called">Not Called</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="attempted">Attempted</SelectItem>
                      <SelectItem value="not_reachable">Not Reachable</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="call_transfer_status" className="text-sm">Call Transfer Status</Label>
                  <Select
                    value={formData.call_transfer_status || 'not_transferred'}
                    onValueChange={(value) => handleSelectChange('call_transfer_status', value)}
                  >
                    <SelectTrigger className="mt-1 h-10 sm:h-9">
                      <SelectValue placeholder="Select transfer status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_transferred">Not Transferred</SelectItem>
                      <SelectItem value="transferred">Transferred</SelectItem>
                      <SelectItem value="not_required">Not Required</SelectItem>
                      <SelectItem value="failed">Transfer Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="transcript" className="text-sm">Call Transcript</Label>
                  <Textarea
                    id="transcript"
                    name="transcript"
                    value={formData.transcript}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 min-h-[80px] sm:min-h-[80px] text-sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="summary" className="text-sm">Call Summary</Label>
                  <Textarea
                    id="summary"
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 min-h-[80px] sm:min-h-[80px] text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-5 sm:mt-6 flex justify-end gap-2">
              <Button type="submit" disabled={loading} className="h-10 sm:h-9 px-4 text-sm">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
} 