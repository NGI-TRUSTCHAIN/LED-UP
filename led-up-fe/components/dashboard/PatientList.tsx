'use client';

/**
 * PatientList.tsx
 *
 * Component for displaying and managing a list of patients
 * with search, filtering, and pagination capabilities.
 */
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  FileText,
  Calendar,
  Mail,
} from 'lucide-react';

// Mock patient data for demonstration
const mockPatients = [
  {
    id: 'P-1001',
    name: 'Sarah Johnson',
    age: 42,
    gender: 'Female',
    contactNumber: '(555) 123-4567',
    lastVisit: '2023-10-15',
    condition: 'Hypertension',
    status: 'Active',
  },
  {
    id: 'P-1002',
    name: 'Michael Chen',
    age: 35,
    gender: 'Male',
    contactNumber: '(555) 234-5678',
    lastVisit: '2023-11-02',
    condition: 'Diabetes Type 2',
    status: 'Active',
  },
  {
    id: 'P-1003',
    name: 'Emily Rodriguez',
    age: 28,
    gender: 'Female',
    contactNumber: '(555) 345-6789',
    lastVisit: '2023-11-10',
    condition: 'Asthma',
    status: 'Active',
  },
  {
    id: 'P-1004',
    name: 'David Wilson',
    age: 56,
    gender: 'Male',
    contactNumber: '(555) 456-7890',
    lastVisit: '2023-09-22',
    condition: 'Arthritis',
    status: 'Inactive',
  },
  {
    id: 'P-1005',
    name: 'Lisa Brown',
    age: 31,
    gender: 'Female',
    contactNumber: '(555) 567-8901',
    lastVisit: '2023-11-15',
    condition: 'Anxiety',
    status: 'Active',
  },
  {
    id: 'P-1006',
    name: 'James Smith',
    age: 48,
    gender: 'Male',
    contactNumber: '(555) 678-9012',
    lastVisit: '2023-10-30',
    condition: 'Hyperlipidemia',
    status: 'Active',
  },
  {
    id: 'P-1007',
    name: 'Maria Garcia',
    age: 39,
    gender: 'Female',
    contactNumber: '(555) 789-0123',
    lastVisit: '2023-11-05',
    condition: 'Migraine',
    status: 'Active',
  },
  {
    id: 'P-1008',
    name: 'Robert Taylor',
    age: 62,
    gender: 'Male',
    contactNumber: '(555) 890-1234',
    lastVisit: '2023-09-18',
    condition: 'COPD',
    status: 'Inactive',
  },
];

/**
 * PatientList component
 *
 * Displays a searchable, filterable list of patients with pagination
 * and actions for each patient record.
 */
const PatientList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const patientsPerPage = 5;

  // Filter patients based on search query and status filter
  const filteredPatients = mockPatients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === null || patient.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Search input */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients..."
            className="pl-9 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <Filter className="h-4 w-4 mr-1" />
              Filter
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>All Patients</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('Active')}>Active Patients</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('Inactive')}>Inactive Patients</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status filter indicator */}
      {statusFilter && (
        <div className="flex items-center">
          <Badge variant="outline" className="mr-2">
            {statusFilter} Patients
          </Badge>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setStatusFilter(null)}>
            Clear
          </Button>
        </div>
      )}

      {/* Patients table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Age</TableHead>
              <TableHead className="hidden md:table-cell">Gender</TableHead>
              <TableHead className="hidden lg:table-cell">Contact</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPatients.length > 0 ? (
              currentPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.id}</TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{patient.age}</TableCell>
                  <TableCell className="hidden md:table-cell">{patient.gender}</TableCell>
                  <TableCell className="hidden lg:table-cell">{patient.contactNumber}</TableCell>
                  <TableCell>{patient.lastVisit}</TableCell>
                  <TableCell>{patient.condition}</TableCell>
                  <TableCell>
                    <Badge variant={patient.status === 'Active' ? 'default' : 'secondary'}>{patient.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          View Records
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule Appointment
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center">
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6">
                  No patients found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {filteredPatients.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {indexOfFirstPatient + 1} to {Math.min(indexOfLastPatient, filteredPatients.length)} of{' '}
            {filteredPatients.length} patients
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="icon"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
