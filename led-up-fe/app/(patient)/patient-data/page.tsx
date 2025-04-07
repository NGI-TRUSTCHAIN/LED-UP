import React from 'react';
import { getProducerRecords } from '@/features/data-registry/actions';
import PatientFull from '@/components/patient-full';
import { getConsentLabel, getStatusLabel } from '@/features/data-registry';

const Page = async () => {
  // in real scenario it should get it from the user's wallet
  const producer = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

  const { status, recordIds, consent, nonce, healthRecords } = await getProducerRecords(producer);

  return (
    <main className="flex flex-col min-h-screen px-4 container mx-auto">
      <div className="my-5 px-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold w-full">Patient Data</h1>

        <div className="flex items-center gap-2">
          <p className="text-sm font-bold flex gap-2 items-center">
            <span className="bg-green-100 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full text-nowrap">
              Record: {getStatusLabel(status)}
            </span>
            <span className=" bg-red-100 text-red-600 text-xs font-medium px-2.5 py-0.5 rounded-full text-nowrap">
              Consent: {getConsentLabel(consent)}
            </span>
          </p>
        </div>
      </div>

      <PatientFull records={healthRecords} />
    </main>
  );
};

export default Page;
