import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InsuranceDetail, TableFilters } from '@/lib/types';
import { insuranceDetailsApi } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import InsuranceRecordDetail from './InsuranceRecordDetail';
import CsvImport from './CsvImport';
import AddInsuranceRecord from './AddInsuranceRecord';

export default function InsuranceTable() {
  const [records, setRecords] = useState<InsuranceDetail[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<InsuranceDetail | null>(null);
  const [recordDetailOpen, setRecordDetailOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filters, setFilters] = useState<TableFilters>({
    page: 1,
    pageSize: 10,
    searchTerm: '',
  });

  // Wrap fetchRecords in useCallback to prevent recreation on every render
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, count } = await insuranceDetailsApi.getAll(
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

  // Fetch data on initial load and when filters or fetchRecords change
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
      await insuranceDetailsApi.delete(id);
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
      await insuranceDetailsApi.deleteAll();
      fetchRecords();
      setDeleteAllConfirmOpen(false);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete all records');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === '') return '-';
    try {
      // Convert to a readable date format
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const totalPages = Math.ceil(totalRecords / filters.pageSize);

  return (
    <div className="space-y-4">
      <Card className="shadow-lg border-t-4 border-t-primary overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-background pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-primary/90 text-xl">Insurance CRM</CardTitle>
              <CardDescription>
                Manage patient insurance details
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <AddInsuranceRecord onSuccess={fetchRecords} />
              <CsvImport onSuccess={fetchRecords} />
              <Dialog open={deleteAllConfirmOpen} onOpenChange={setDeleteAllConfirmOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                    Delete All
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete All Records</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete all insurance records? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteAllConfirmOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteAll} disabled={deleteLoading}>
                      {deleteLoading ? 'Deleting...' : 'Delete All'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="mt-4 relative">
            <Input
              placeholder="Search by name, phone, member ID, or insurance company..."
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
                <TableRow className="bg-muted/30 hover:bg-muted/50">
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Insurance</TableHead>
                  <TableHead className="hidden md:table-cell">Member ID</TableHead>
                  <TableHead className="hidden sm:table-cell">Appointment</TableHead>
                  <TableHead className="hidden lg:table-cell">Eligibility</TableHead>
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
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <path d="M12 18v-6"></path>
                          <path d="M8 18v-1"></path>
                          <path d="M16 18v-3"></path>
                        </svg>
                        <span>No records found. Import data or add a new record.</span>
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
                      <TableCell className="font-medium whitespace-nowrap">
                        {record.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm whitespace-nowrap">
                        {record.phone_number}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {record.insurance_company || '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs">
                        {record.member_id}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell whitespace-nowrap text-sm">
                        {formatDate(record.appointment_date)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.eligibility_status?.toLowerCase() === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' 
                              : record.eligibility_status?.toLowerCase() === 'inactive'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                          }`}
                        >
                          {record.eligibility_status || 'Unknown'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedRecord(record);
                              setRecordDetailOpen(true);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                              <path d="m15 5 4 4"></path>
                            </svg>
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-8 w-8 text-destructive border-destructive hover:bg-destructive/10"
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
                            <span className="sr-only">Delete</span>
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
        
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {records.length} of {totalRecords} {totalRecords === 1 ? 'record' : 'records'}
          </div>
          
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => filters.page > 1 && handlePageChange(filters.page - 1)} 
                    className={filters.page <= 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    aria-disabled={filters.page <= 1}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pagination centered around current page
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (filters.page > 3) {
                      pageNum = filters.page + i - 2;
                    }
                    if (filters.page > totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    }
                  }
                  
                  if (pageNum <= totalPages && pageNum > 0) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          isActive={pageNum === filters.page}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => filters.page < totalPages && handlePageChange(filters.page + 1)} 
                    className={filters.page >= totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    aria-disabled={filters.page >= totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardFooter>
      </Card>
      
      {/* Record detail dialog */}
      <InsuranceRecordDetail 
        record={selectedRecord} 
        open={recordDetailOpen} 
        onOpenChange={setRecordDetailOpen}
        onSuccess={fetchRecords}
      />
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedRecord?.name}&apos;s record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedRecord && handleDelete(selectedRecord.id)} 
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 