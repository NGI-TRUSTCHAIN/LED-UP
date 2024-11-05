import React from 'react';
import { getProducerRecords } from '@/lib/actions/file';
import PatientFull from '@/components/patient-full';

enum ConsentStatus {
  Allowed = 0, // Consent is granted
  Denied = 1, // Consent is denied
  Pending = 2, // Consent is pending
}

enum RecordStatus {
  ACTIVE = 0, // Record is active
  INACTIVE = 1, // Record is inactive
  SUSPENDED = 2, // Record is suspended
  ERROR = 3, // Record has encountered an error
  UNKNOWN = 4, // Record status is unknown
}

const Page = async () => {
  const { records } = await getProducerRecords();
  const getConsentStatus = (status: ConsentStatus) => {
    switch (status) {
      case ConsentStatus.Allowed:
        return 'Allowed';
      case ConsentStatus.Denied:
        return 'Denied';
      case ConsentStatus.Pending:
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getRecordStatus = (status: RecordStatus) => {
    switch (status) {
      case RecordStatus.ACTIVE:
        return 'Active';
      case RecordStatus.INACTIVE:
        return 'Inactive';
      case RecordStatus.SUSPENDED:
        return 'Suspended';
      case RecordStatus.ERROR:
        return 'Error';
      case RecordStatus.UNKNOWN:
        return 'Unknown';
      default:
        return 'Unknown';
    }
  };
  return (
    <main className="flex flex-col min-h-screen px-4 container mx-auto">
      <div className="my-5 px-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold w-full">Patient Data</h1>

        <div className="flex items-center gap-2">
          <p className="text-sm font-bold flex gap-2 items-center">
            <span className="bg-green-100 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full text-nowrap">
              Record: {getRecordStatus(records[0])}
            </span>
            <span className=" bg-red-100 text-red-600 text-xs font-medium px-2.5 py-0.5 rounded-full text-nowrap">
              Consent: {getConsentStatus(records[1])}
            </span>
          </p>
        </div>
      </div>

      <PatientFull records={records} />
    </main>
  );
};

export default Page;
