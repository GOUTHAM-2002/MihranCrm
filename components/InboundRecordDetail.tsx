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
      <DialogHeader>
        <DialogTitle>Inbound Record</DialogTitle>
        <DialogDescription>
          View and edit details for this appointment record
        </DialogDescription>
      </DialogHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="mt-4">
          <InboundRecordView record={record} />
        </TabsContent>
        
        <TabsContent value="edit" className="mt-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="appointment_number">Appointment Number</Label>
                  <Input
                    id="appointment_number"
                    name="appointment_number"
                    value={formData.appointment_number}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="appointment_date">Appointment Date</Label>
                  <Input
                    id="appointment_date"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="previous_appointment_date">Previous Appointment Date</Label>
                  <Input
                    id="previous_appointment_date"
                    name="previous_appointment_date"
                    value={formData.previous_appointment_date}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Appointment Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Returning">Returning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="insurance_policy"
                    checked={formData.insurance_policy}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('insurance_policy', checked as boolean)
                    }
                  />
                  <Label htmlFor="insurance_policy">Has Insurance Policy</Label>
                </div>
                
                <div className={!formData.insurance_policy ? 'opacity-50 pointer-events-none' : ''}>
                  <Label htmlFor="insurance_name">Insurance Name</Label>
                  <Input
                    id="insurance_name"
                    name="insurance_name"
                    value={formData.insurance_name}
                    onChange={handleInputChange}
                    disabled={!formData.insurance_policy}
                  />
                </div>
                
                <div className={!formData.insurance_policy ? 'opacity-50 pointer-events-none' : ''}>
                  <Label htmlFor="member_id">Member ID</Label>
                  <Input
                    id="member_id"
                    name="member_id"
                    value={formData.member_id}
                    onChange={handleInputChange}
                    disabled={!formData.insurance_policy}
                  />
                </div>
                
                <div className={!formData.insurance_policy ? 'opacity-50 pointer-events-none' : ''}>
                  <Label htmlFor="group_number">Group Number</Label>
                  <Input
                    id="group_number"
                    name="group_number"
                    value={formData.group_number}
                    onChange={handleInputChange}
                    disabled={!formData.insurance_policy}
                  />
                </div>
                
                <div className="pt-2">
                  <Label htmlFor="call_status">Call Status</Label>
                  <Select
                    value={formData.call_status || 'not_called'}
                    onValueChange={(value) => handleSelectChange('call_status', value)}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="call_transfer_status">Call Transfer Status</Label>
                  <Select
                    value={formData.call_transfer_status || 'not_transferred'}
                    onValueChange={(value) => handleSelectChange('call_transfer_status', value)}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="transcript">Call Transcript</Label>
                  <Textarea
                    id="transcript"
                    name="transcript"
                    value={formData.transcript}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="summary">Call Summary</Label>
                  <Textarea
                    id="summary"
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
} 