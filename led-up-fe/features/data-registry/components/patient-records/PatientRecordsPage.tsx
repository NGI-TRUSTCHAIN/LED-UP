'use client';

import React from 'react';
import { PatientRecordsPage as PatientRecordsPageContainer } from './PatientRecordsContainer';

// The main component is now just a simple wrapper around our refactored container
export function PatientRecordsPage() {
  return <PatientRecordsPageContainer />;
}
