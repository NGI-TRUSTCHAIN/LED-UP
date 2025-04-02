'use client';

/**
 * MedicalRecords.tsx
 *
 * Component for displaying and managing patient medical records
 * with filtering, categorization, and detailed views.
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  FileText,
  FilePlus,
  Calendar,
  Pill,
  Microscope,
  FileImage,
  Clock,
  ChevronRight,
  Download,
  Share2,
} from 'lucide-react';

// Mock medical records data for demonstration
const mockRecords = [
  {
    id: 'MR-2023-001',
    patientId: 'P-1001',
    patientName: 'Sarah Johnson',
    type: 'Consultation',
    date: '2023-11-15',
    doctor: 'Dr. Anderson',
    description: 'Follow-up appointment for hypertension management',
    category: 'visit',
    tags: ['hypertension', 'follow-up'],
  },
  {
    id: 'MR-2023-002',
    patientId: 'P-1002',
    patientName: 'Michael Chen',
    type: 'Lab Results',
    date: '2023-11-10',
    doctor: 'Dr. Anderson',
    description: 'Blood glucose and HbA1c test results',
    category: 'lab',
    tags: ['diabetes', 'blood test'],
  },
  {
    id: 'MR-2023-003',
    patientId: 'P-1003',
    patientName: 'Emily Rodriguez',
    type: 'Prescription',
    date: '2023-11-12',
    doctor: 'Dr. Anderson',
    description: 'Albuterol inhaler prescription renewal',
    category: 'medication',
    tags: ['asthma', 'prescription'],
  },
  {
    id: 'MR-2023-004',
    patientId: 'P-1001',
    patientName: 'Sarah Johnson',
    type: 'Imaging',
    date: '2023-10-28',
    doctor: 'Dr. Wilson',
    description: 'Chest X-ray results',
    category: 'imaging',
    tags: ['x-ray', 'chest'],
  },
  {
    id: 'MR-2023-005',
    patientId: 'P-1005',
    patientName: 'Lisa Brown',
    type: 'Consultation',
    date: '2023-11-15',
    doctor: 'Dr. Anderson',
    description: 'Initial assessment for anxiety symptoms',
    category: 'visit',
    tags: ['anxiety', 'initial'],
  },
  {
    id: 'MR-2023-006',
    patientId: 'P-1006',
    patientName: 'James Smith',
    type: 'Lab Results',
    date: '2023-10-30',
    doctor: 'Dr. Anderson',
    description: 'Lipid panel results',
    category: 'lab',
    tags: ['cholesterol', 'lipids'],
  },
  {
    id: 'MR-2023-007',
    patientId: 'P-1007',
    patientName: 'Maria Garcia',
    type: 'Prescription',
    date: '2023-11-05',
    doctor: 'Dr. Anderson',
    description: 'Sumatriptan prescription for migraine management',
    category: 'medication',
    tags: ['migraine', 'prescription'],
  },
  {
    id: 'MR-2023-008',
    patientId: 'P-1004',
    patientName: 'David Wilson',
    type: 'Imaging',
    date: '2023-09-22',
    doctor: 'Dr. Roberts',
    description: 'MRI of right knee',
    category: 'imaging',
    tags: ['mri', 'knee', 'arthritis'],
  },
];

// Mock detailed record for the dialog
const mockDetailedRecord = {
  id: 'MR-2023-001',
  patientId: 'P-1001',
  patientName: 'Sarah Johnson',
  type: 'Consultation',
  date: '2023-11-15',
  time: '10:30 AM',
  doctor: 'Dr. Anderson',
  location: 'Main Clinic, Room 305',
  vitalSigns: {
    bloodPressure: '138/85 mmHg',
    heartRate: '72 bpm',
    temperature: '98.6°F',
    respiratoryRate: '16/min',
    oxygenSaturation: '98%',
  },
  chiefComplaint: 'Follow-up for hypertension management',
  assessment:
    "Patient's blood pressure remains slightly elevated despite current medication regimen. Patient reports adherence to medication schedule but admits to increased salt intake and reduced physical activity over the past month.",
  plan: 'Increase lisinopril dosage from 10mg to 20mg daily. Reinforce dietary sodium restrictions and recommend 30 minutes of moderate exercise at least 5 days per week. Schedule follow-up in 4 weeks to reassess blood pressure control.',
  medications: [
    {
      name: 'Lisinopril',
      dosage: '20mg',
      frequency: 'Once daily',
      instructions: 'Take in the morning with or without food',
    },
    {
      name: 'Hydrochlorothiazide',
      dosage: '12.5mg',
      frequency: 'Once daily',
      instructions: 'Take in the morning with food',
    },
  ],
  category: 'visit',
  tags: ['hypertension', 'follow-up', 'medication adjustment'],
};

// Icons for different record types
const recordTypeIcons: Record<string, React.ElementType> = {
  visit: Calendar,
  lab: Microscope,
  medication: Pill,
  imaging: FileImage,
};

/**
 * MedicalRecords component
 *
 * Displays and manages patient medical records with filtering by type
 * and detailed view capabilities.
 */
const MedicalRecords: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<typeof mockDetailedRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter records based on search query
  const filteredRecords = mockRecords.filter((record) => {
    return (
      record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Group records by category
  const recordsByCategory = {
    all: filteredRecords,
    visit: filteredRecords.filter((record) => record.category === 'visit'),
    lab: filteredRecords.filter((record) => record.category === 'lab'),
    medication: filteredRecords.filter((record) => record.category === 'medication'),
    imaging: filteredRecords.filter((record) => record.category === 'imaging'),
  };

  // Handle record selection for detailed view
  const handleRecordClick = (recordId: string) => {
    // In a real app, you would fetch the detailed record data
    // For now, we'll just use our mock data
    setSelectedRecord(mockDetailedRecord);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Medical Records</h2>
          <p className="text-muted-foreground">View and manage patient medical records</p>
        </div>

        <Button className="flex items-center gap-2">
          <FilePlus className="h-4 w-4" />
          Add New Record
        </Button>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search records by patient name, ID, or keywords..."
          className="pl-9 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Records tabs by category */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="visit">Consultations</TabsTrigger>
          <TabsTrigger value="lab">Lab Results</TabsTrigger>
          <TabsTrigger value="medication">Prescriptions</TabsTrigger>
          <TabsTrigger value="imaging">Imaging</TabsTrigger>
        </TabsList>

        {Object.entries(recordsByCategory).map(([category, records]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {records.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {records.map((record) => {
                  const RecordIcon = recordTypeIcons[record.category] || FileText;
                  return (
                    <Card key={record.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 rounded-md bg-primary/10">
                              <RecordIcon className="h-4 w-4 text-primary" />
                            </div>
                            <CardTitle className="text-base">{record.type}</CardTitle>
                          </div>
                          <Badge variant="outline">{record.category}</Badge>
                        </div>
                        <CardDescription className="pt-1">
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-1 h-3 w-3" /> {record.date}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="font-medium">{record.patientName}</div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{record.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {record.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 flex justify-between">
                        <div className="text-xs text-muted-foreground">Doctor: {record.doctor}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => handleRecordClick(record.id)}
                        >
                          View <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 border rounded-md">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">No records found</h3>
                <p className="text-muted-foreground">No medical records match your search criteria.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Detailed record dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Medical Record Details</DialogTitle>
            <DialogDescription>Complete information for record {selectedRecord?.id}</DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 pb-4">
                {/* Header information */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedRecord.type}</h3>
                    <p className="text-muted-foreground">
                      {selectedRecord.patientName} (ID: {selectedRecord.patientId})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" /> {selectedRecord.date}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground ml-4">
                      <Clock className="mr-1 h-4 w-4" /> {selectedRecord.time}
                    </div>
                  </div>
                </div>

                {/* Vital signs */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Vital Signs</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(selectedRecord.vitalSigns).map(([key, value]) => (
                      <div key={key} className="bg-muted/50 p-2 rounded-md">
                        <div className="text-xs text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="font-medium">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assessment and plan */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Chief Complaint</h4>
                    <p>{selectedRecord.chiefComplaint}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Assessment</h4>
                    <p>{selectedRecord.assessment}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Plan</h4>
                    <p>{selectedRecord.plan}</p>
                  </div>
                </div>

                {/* Medications */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Medications</h4>
                  <div className="space-y-3">
                    {selectedRecord.medications.map((medication, index) => (
                      <div key={index} className="border p-3 rounded-md">
                        <div className="font-medium">
                          {medication.name} {medication.dosage}
                        </div>
                        <div className="text-sm">{medication.frequency}</div>
                        <div className="text-sm text-muted-foreground mt-1">{medication.instructions}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Record Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Record ID:</span>
                        <span>{selectedRecord.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Doctor:</span>
                        <span>{selectedRecord.doctor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Location:</span>
                        <span>{selectedRecord.location}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedRecord.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-between items-center pt-4 border-t mt-auto">
            <div className="text-sm text-muted-foreground">Last updated: Today at 10:45 AM</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button size="sm">Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicalRecords;
