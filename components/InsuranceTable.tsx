import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InsuranceDetail, TableFilters } from '@/lib/types';
import { insuranceDetailsApi } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import InsuranceRecordDetail from './InsuranceRecordDetail';
import CsvImport from './CsvImport';
import AddInsuranceRecord from './AddInsuranceRecord';
import { TbDotsVertical, TbTrash, TbPencil } from 'react-icons/tb';

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
      <Card className="shadow-lg border-t-4 border-t-primary">
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-primary/80">Insurance CRM</CardTitle>
              <CardDescription>
                Manage patient insurance details
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <AddInsuranceRecord onSuccess={fetchRecords} />
              <CsvImport onSuccess={fetchRecords} />
              <Dialog open={deleteAllConfirmOpen} onOpenChange={setDeleteAllConfirmOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <TbTrash className="mr-2 h-4 w-4" />
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
          
          <div className="mt-4">
            <Input
              placeholder="Search by name, phone, member ID, or insurance company..."
              value={filters.searchTerm}
              onChange={handleSearch}
              className="max-w-md"
            />
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
                <TableRow className="bg-muted/50 hover:bg-muted">
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Insurance</TableHead>
                  <TableHead className="hidden md:table-cell">Member ID</TableHead>
                  <TableHead>Appointment</TableHead>
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
                      No records found. Import data or add a new record.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map(record => (
                    <TableRow 
                      key={record.id} 
                      className="group transition-colors hover:bg-muted/50 cursor-pointer"
                      onClick={() => {
                        setSelectedRecord(record);
                        setRecordDetailOpen(true);
                      }}
                    >
                      <TableCell className="font-medium">{record.name}</TableCell>
                      <TableCell>{record.phone_number}</TableCell>
                      <TableCell className="hidden md:table-cell">{record.insurance_company || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell">{record.member_id || '-'}</TableCell>
                      <TableCell>{record.appointment_date ? formatDate(record.appointment_date) : '-'}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {record.eligibility_status ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            record.eligibility_status === 'Active' ? 'bg-green-100 text-green-800' :
                            record.eligibility_status === 'Inactive' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.eligibility_status}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                              <TbDotsVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecord(record);
                              setRecordDetailOpen(true);
                            }}>
                              <TbPencil className="mr-2 h-4 w-4" />
                              View & Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRecord(record);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <TbTrash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {records.length} of {totalRecords} records
          </div>
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => filters.page > 1 && handlePageChange(filters.page - 1)} 
                    className={filters.page === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  // Show pagination centered around current page
                  let pageToShow;
                  if (totalPages <= 5) {
                    pageToShow = i + 1;
                  } else if (filters.page <= 3) {
                    pageToShow = i + 1;
                  } else if (filters.page >= totalPages - 2) {
                    pageToShow = totalPages - 4 + i;
                  } else {
                    pageToShow = filters.page - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={pageToShow === filters.page}
                        onClick={() => handlePageChange(pageToShow)}
                      >
                        {pageToShow}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => filters.page < totalPages && handlePageChange(filters.page + 1)} 
                    className={filters.page === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardFooter>
      </Card>
      
      {/* Details Dialog */}
      <InsuranceRecordDetail
        record={selectedRecord}
        open={recordDetailOpen}
        onOpenChange={setRecordDetailOpen}
        onSuccess={fetchRecords}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the record for {selectedRecord?.name}? This action cannot be undone.
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