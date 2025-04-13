import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InboundRecord, TableFilters } from '@/lib/types';
import { inboundApi } from '@/lib/supabase';
import InboundRecordDetail from './InboundRecordDetail';
import AddInboundRecord from './AddInboundRecord';

export default function InboundTable() {
  const [records, setRecords] = useState<InboundRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<InboundRecord | null>(null);
  const [recordDetailOpen, setRecordDetailOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filters, setFilters] = useState<TableFilters>({
    page: 1,
    pageSize: 10,
    searchTerm: '',
  });

  // Fetch records based on current filters
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, count } = await inboundApi.getAll(
        filters.page,
        filters.pageSize,
        filters.searchTerm
      );
      
      setRecords(data || []);
      setTotalRecords(count || 0);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.pageSize, filters.searchTerm]);

  // Fetch data on initial load and when filters change
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: e.target.value,
      page: 1, // Reset to first page on new search
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    
    try {
      await inboundApi.delete(id);
      fetchRecords();
      setDeleteConfirmOpen(false);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    setDeleteLoading(true);
    
    try {
      await inboundApi.deleteAll();
      fetchRecords();
      setDeleteAllConfirmOpen(false);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete all records');
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / filters.pageSize);

  return (
    <div className="space-y-4">
      <Card className="shadow-lg border-t-4 border-t-primary overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-background pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-primary/90 text-xl">Inbound Appointments</CardTitle>
              <CardDescription>
                Manage patient appointments and insurance information
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 items-center mt-2 sm:mt-0">
              <AddInboundRecord onSuccess={fetchRecords} />
              <Dialog open={deleteAllConfirmOpen} onOpenChange={setDeleteAllConfirmOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="flex items-center gap-1.5 h-9 px-3 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                    Delete All
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-md p-3 sm:p-6">
                  <DialogHeader className="mb-2 sm:mb-4">
                    <DialogTitle className="text-lg">Delete All Records</DialogTitle>
                    <DialogDescription className="text-sm opacity-80">
                      Are you sure you want to delete all inbound records? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4 sm:mt-6">
                    <Button variant="outline" onClick={() => setDeleteAllConfirmOpen(false)} className="h-9 px-3 sm:px-4 text-sm">Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteAll} disabled={deleteLoading} className="h-9 px-3 sm:px-4 text-sm">
                      {deleteLoading ? 'Deleting...' : 'Delete All'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="mt-4 relative">
            <Input
              placeholder="Search by appointment number, phone, address, or insurance info..."
              value={filters.searchTerm}
              onChange={handleSearch}
              className="pr-9"
            />
            {filters.searchTerm ? (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full aspect-square text-muted-foreground hover:text-foreground"
                onClick={() => setFilters(prev => ({ ...prev, searchTerm: '', page: 1 }))}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
                <span className="sr-only">Clear search</span>
              </Button>
            ) : (
              <div className="absolute right-3 top-0 h-full flex items-center text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
            )}
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
                <TableRow>
                  <TableHead className="w-[120px]">App #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden xs:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Insurance</TableHead>
                  <TableHead className="hidden lg:table-cell">Call Status</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={8} className="h-14">
                        <div className="w-full h-4 bg-muted/50 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span>No records found. Add a new inbound record.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map(record => (
                    <TableRow 
                      key={record.id} 
                      className="group hover:bg-muted/40 hover:shadow-sm transition-all cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedRecord(record);
                        setRecordDetailOpen(true);
                      }}
                    >
                      <TableCell className="font-medium whitespace-nowrap text-sm">
                        {record.appointment_number}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {record.name || '-'}
                      </TableCell>
                      <TableCell className="hidden xs:table-cell whitespace-nowrap text-sm">
                        {record.appointment_date}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          record.type === 'New' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {record.type}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-sm">
                        {record.phone}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {record.insurance_policy ? (
                          <span className="inline-flex items-center">
                            <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            {record.insurance_name || 'Yes'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center">
                            <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            No
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 md:w-auto md:px-2 md:py-1 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setSelectedRecord(record);
                              setRecordDetailOpen(true);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9"></path>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                            <span className="hidden md:inline ml-1">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 md:w-auto md:px-2 md:py-1 text-muted-foreground hover:text-red-600"
                            onClick={() => {
                              setSelectedRecord(record);
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                            <span className="hidden md:inline ml-1">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="py-4 flex items-center justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
                      className={filters.page <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Logic to show pages around the current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (filters.page <= 3) {
                      pageNum = i + 1;
                    } else if (filters.page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = filters.page - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={filters.page === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages, filters.page + 1))}
                      className={filters.page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedRecord && (
        <>
          <Dialog open={recordDetailOpen} onOpenChange={setRecordDetailOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-6">
              <InboundRecordDetail 
                record={selectedRecord}
                onUpdate={() => {
                  fetchRecords();
                  setRecordDetailOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-md p-3 sm:p-6">
              <DialogHeader className="mb-2 sm:mb-4">
                <DialogTitle className="text-lg">Delete Record</DialogTitle>
                <DialogDescription className="text-sm opacity-80">
                  Are you sure you want to delete this record? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 sm:mt-6">
                <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="h-9 px-3 sm:px-4 text-sm">Cancel</Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDelete(selectedRecord.id)} 
                  disabled={deleteLoading}
                  className="h-9 px-3 sm:px-4 text-sm"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
} 