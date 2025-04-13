"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Plus, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Call {
  id: string;
  pharmacy: string;
  drug: string;
  special_request: string;
  call_status: 'Called' | 'Not Called';
  status: 'Successful' | 'Failed';
  response: string;
  delivery_time: string;
  summary: string;
  transcript: string;
  call_recording: string;
  created_at: string;
  phonenumber: string;
}

export default function CallsTable() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    pharmacy: '',
    drug: '',
    special_request: '',
    call_status: 'Not Called' as 'Not Called' | 'Called',
    status: 'Failed' as 'Failed' | 'Successful',
    phonenumber: '',
  });

  const fetchCalls = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCalls(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch calls');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCall) {
        const { error } = await supabase
          .from('calls')
          .update(formData)
          .eq('id', selectedCall.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('calls')
          .insert([formData]);

        if (error) throw error;
      }
      setIsDialogOpen(false);
      setSelectedCall(null);
      setFormData({
        pharmacy: '',
        drug: '',
        special_request: '',
        call_status: 'Not Called',
        status: 'Failed',
        phonenumber: '',
      });
      fetchCalls();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save call');
    }
  };

  const handleDelete = async () => {
    if (!selectedCall) return;
    try {
      const { error } = await supabase
        .from('calls')
        .delete()
        .eq('id', selectedCall.id);

      if (error) throw error;
      setIsDeleteDialogOpen(false);
      setSelectedCall(null);
      fetchCalls();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete call');
    }
  };

  const handleEdit = (call: Call) => {
    setSelectedCall(call);
    setFormData({
      pharmacy: call.pharmacy || '',
      drug: call.drug || '',
      special_request: call.special_request || '',
      call_status: call.call_status,
      status: call.status,
      phonenumber: call.phonenumber || '',
    });
    setIsDialogOpen(true);
  };

  const handleCall = async (call: Call) => {
    try {
      const { error } = await supabase
        .from('calls')
        .update({ call_status: 'Called' })
        .eq('id', call.id);

      if (error) throw error;
      fetchCalls();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update call status');
    }
  };

  const handleRowClick = (call: Call) => {
    console.log('Row clicked:', call.id);
    setSelectedCall(call);
    setIsDetailsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-lg border-t-4 border-t-primary overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-background pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-primary/90 text-xl">Call Management</CardTitle>
              <CardDescription>
                Track and manage pharmacy calls
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Call
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {error && (
            <Alert variant="destructive" className="m-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/50">
                  <TableHead>Pharmacy</TableHead>
                  <TableHead>Drug</TableHead>
                  <TableHead>Special Request</TableHead>
                  <TableHead>Call Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={7} className="h-14">
                        <div className="w-full h-4 bg-muted/50 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : calls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No calls found. Create a new call to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  calls.map((call) => (
                    <TableRow 
                      key={call.id} 
                      className="group hover:bg-muted/40 hover:shadow-sm transition-all cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRowClick(call);
                      }}
                    >
                      <TableCell className="font-medium">{call.pharmacy || '-'}</TableCell>
                      <TableCell>{call.drug || '-'}</TableCell>
                      <TableCell>{call.special_request || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          call.call_status === 'Called' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                        }`}>
                          {call.call_status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          call.status === 'Successful'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                        }`}>
                          {call.status}
                        </span>
                      </TableCell>
                      <TableCell>{format(new Date(call.created_at), 'MMM d, yyyy HH:mm')}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-8 w-8",
                              call.call_status === 'Called' 
                                ? "text-green-600 hover:text-green-700 bg-green-50"
                                : "text-green-600 hover:text-green-700"
                            )}
                            onClick={() => handleCall(call)}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(call)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedCall(call);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCall ? 'Edit Call' : 'New Call'}</DialogTitle>
            <DialogDescription>
              {selectedCall ? 'Update call details below.' : 'Enter call details below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pharmacy">Pharmacy</Label>
              <Input
                id="pharmacy"
                value={formData.pharmacy}
                onChange={(e) => setFormData({ ...formData, pharmacy: e.target.value })}
                placeholder="Enter pharmacy name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drug">Drug</Label>
              <Input
                id="drug"
                value={formData.drug}
                onChange={(e) => setFormData({ ...formData, drug: e.target.value })}
                placeholder="Enter drug name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="special_request">Special Request</Label>
              <Textarea
                id="special_request"
                value={formData.special_request}
                onChange={(e) => setFormData({ ...formData, special_request: e.target.value })}
                placeholder="Enter any special requests"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="call_status">Call Status</Label>
              <select
                id="call_status"
                value={formData.call_status}
                onChange={(e) => setFormData({ ...formData, call_status: e.target.value as 'Called' | 'Not Called' })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="Not Called">Not Called</option>
                <option value="Called">Called</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Successful' | 'Failed' })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="Failed">Failed</option>
                <option value="Successful">Successful</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phonenumber">Phone Number</Label>
              <Input
                id="phonenumber"
                value={formData.phonenumber}
                onChange={(e) => setFormData({ ...formData, phonenumber: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedCall ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Call</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this call? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh] p-6">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-primary">{selectedCall?.pharmacy || 'Call Details'}</DialogTitle>
            <DialogDescription>
              Complete information about the call
            </DialogDescription>
          </DialogHeader>
          
          {selectedCall && (
            <div className="py-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-card rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-primary text-lg mb-3 flex items-center">
                      Basic Information
                      <div className="h-px flex-grow bg-muted ml-3"></div>
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Pharmacy</Label>
                        <p className="font-medium">{selectedCall.pharmacy || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Phone Number</Label>
                        <p className="font-medium">{selectedCall.phonenumber || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Drug</Label>
                        <p className="font-medium">{selectedCall.drug || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Created At</Label>
                        <p className="font-medium">{format(new Date(selectedCall.created_at), 'MMM d, yyyy HH:mm')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-primary text-lg mb-3 flex items-center">
                      Status Information
                      <div className="h-px flex-grow bg-muted ml-3"></div>
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Call Status</Label>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            selectedCall.call_status === 'Called' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                          }`}>
                            {selectedCall.call_status === 'Called' ? 
                              <CheckCircle2 className="h-3 w-3 mr-1" /> : 
                              <Phone className="h-3 w-3 mr-1" />
                            }
                            {selectedCall.call_status}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            selectedCall.status === 'Successful'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          }`}>
                            {selectedCall.status === 'Successful' ? 
                              <CheckCircle2 className="h-3 w-3 mr-1" /> : 
                              <XCircle className="h-3 w-3 mr-1" />
                            }
                            {selectedCall.status}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Delivery Time</Label>
                        <p className="font-medium">{selectedCall.delivery_time || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-card rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-primary text-lg mb-3 flex items-center">
                      Request & Response
                      <div className="h-px flex-grow bg-muted ml-3"></div>
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Special Request</Label>
                        <div className="p-3 bg-muted/30 rounded-md text-sm">
                          <p className="whitespace-pre-wrap">{selectedCall.special_request || '-'}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Response</Label>
                        <div className="p-3 bg-muted/30 rounded-md text-sm">
                          <p className="whitespace-pre-wrap">{selectedCall.response || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-primary text-lg mb-3 flex items-center">
                      Call Details
                      <div className="h-px flex-grow bg-muted ml-3"></div>
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Summary</Label>
                        <div className="p-3 bg-muted/30 rounded-md text-sm">
                          <p className="whitespace-pre-wrap">{selectedCall.summary || '-'}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Transcript</Label>
                        <div className="p-3 bg-muted/30 rounded-md text-sm max-h-44 overflow-y-auto">
                          <p className="whitespace-pre-wrap">{selectedCall.transcript || '-'}</p>
                        </div>
                      </div>
                      {selectedCall.call_recording && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Call Recording</Label>
                          <div className="p-3 bg-muted/30 rounded-md text-sm">
                            <a 
                              href={selectedCall.call_recording} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-primary hover:underline"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                              Listen to Recording
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-4 mt-6">
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => handleEdit(selectedCall!)}>
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 