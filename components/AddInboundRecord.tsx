import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { InboundRecord } from '@/lib/types';
import { inboundApi } from '@/lib/supabase';

interface AddInboundRecordProps {
  onSuccess: () => void;
}

export default function AddInboundRecord({ onSuccess }: AddInboundRecordProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InboundRecord>>({
    name: '',
    appointment_number: '',
    appointment_date: '',
    previous_appointment_date: '',
    type: 'New',
    dob: '',
    phone: '',
    address: '',
    insurance_policy: false,
    insurance_name: '',
    member_id: '',
    group_number: '',
    call_status: 'not_called',
    call_transfer_status: 'not_transferred',
    summary: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await inboundApi.create(formData as Omit<InboundRecord, 'id' | 'created_at'>);
      onSuccess();
      setOpen(false);
      resetForm();
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      appointment_number: '',
      appointment_date: '',
      previous_appointment_date: '',
      type: 'New',
      dob: '',
      phone: '',
      address: '',
      insurance_policy: false,
      insurance_name: '',
      member_id: '',
      group_number: '',
      call_status: 'not_called',
      call_transfer_status: 'not_transferred',
      summary: ''
    });
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14"></path>
            <path d="M5 12h14"></path>
          </svg>
          Add Record
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Inbound Record</DialogTitle>
          <DialogDescription>
            Enter details to create a new patient appointment record
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
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
                  type="date"
                />
              </div>
              
              <div>
                <Label htmlFor="previous_appointment_date">Previous Appointment Date</Label>
                <Input
                  id="previous_appointment_date"
                  name="previous_appointment_date"
                  value={formData.previous_appointment_date}
                  onChange={handleInputChange}
                  type="date"
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
                  type="date"
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
                  placeholder="e.g., (555) 123-4567"
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
                  placeholder="Street, City, State, ZIP"
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
                  placeholder="e.g., Aetna, Blue Cross"
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
                  placeholder="Insurance Member ID"
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
                  placeholder="Insurance Group Number"
                />
              </div>
              
              <div className="pt-2">
                <Label htmlFor="call_status">Call Status</Label>
                <Select
                  value={formData.call_status}
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
                  value={formData.call_transfer_status}
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
                <Label htmlFor="summary">Notes / Summary</Label>
                <Textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any additional notes about this appointment"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 