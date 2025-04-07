'use client';

import React from 'react';
import { PatientRecordsContent } from './PatientRecordsContainer';

// The main component is now just a wrapper around our refactored container
const PatientRecordsGrid = React.memo(({ records, isLoading }: { records: any; isLoading: boolean }) => {
  return <PatientRecordsContent records={records} isLoading={isLoading} />;
});

// Set display name for debugging
PatientRecordsGrid.displayName = 'PatientRecordsGrid';

export { PatientRecordsGrid };
