'use client';
import ResourceCard from '@/components/ResourceCard';
import ResourceModal from '@/components/ResourceModal';
import { HealthRecord } from '@/features/data-registry';
import { useState } from 'react';

export type DataType = [string, string, [string, string, string]];

const emoji = (resourceType: string) => {
  switch (resourceType) {
    case 'Patient':
      return { emoji: '🧑‍⚕️', name: 'Patient Info', iconBg: 'bg-blue-100' };
    case 'Condition':
      return { emoji: '🏥', name: 'Condition', iconBg: 'bg-green-100' };
    case 'Procedure':
      return { emoji: '⚕️', name: 'Procedure', iconBg: 'bg-yellow-100' };
    case 'Encounter':
      return { emoji: '🏥', name: 'Encounter', iconBg: 'bg-orange-100' };
    case 'FamilyMemberHistory':
      return { emoji: '👪', name: 'Family Member History', iconBg: 'bg-purple-100' };
    case 'MedicationStatement':
      return { emoji: '💊', name: 'Medication Statement', iconBg: 'bg-red-100' };
    case 'AllergyIntolerance':
      return { emoji: '🚨', name: 'Allergy Intolerance', iconBg: 'bg-red-100' };
    case 'Basic':
      return { emoji: '👫', name: 'Social History', iconBg: 'bg-teal-100' };
    case 'Immunization':
      return { emoji: '💉', name: 'Immunization', iconBg: 'bg-pink-100' };
    case 'AdverseEvent':
      return { emoji: '⚠️', name: 'Adverse Event', iconBg: 'bg-yellow-200' };
    case 'Observation':
      return { emoji: '👀', name: 'Observation', iconBg: 'bg-gray-100' };
    default:
      return { emoji: '❓', name: 'Unknown', iconBg: 'bg-gray-200' };
  }
};

export default function PatientFull({ records }: { records: HealthRecord[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState(null);

  function flatMapMostInnerLevel(arr: any[]): any[] {
    return arr.map((item) =>
      Array.isArray(item)
        ? item.map((subItem) => (Array.isArray(subItem) ? subItem.flatMap((innerItem) => innerItem) : subItem))
        : item
    );
  }
  const getData = () => {
    const data = flatMapMostInnerLevel(records);

    return data[2].map((record: any, index: number) => ({
      id: data[3][index],
      signature: record[0],
      resourceType: record[1],
      cid: record[2],
      cidLink: record[3],
      hash: record[4],
    }));
  };

  const openModal = (tracker: any) => {
    setSelectedTracker(tracker);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="relative overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {getData().map((record: any) => (
              <ResourceCard
                key={record.id}
                icon={emoji(record.resourceType).emoji}
                resourceName={emoji(record.resourceType).name}
                signature={record.signature}
                cidLink={record.cidLink}
                cid={record.cid}
                iconBg={emoji(record.resourceType).iconBg}
                onClick={(data: any) => openModal({ title: record.resourceType, value: record.signature, data: data })}
              />
            ))}
          </div>
        </div>
      </main>
      <ResourceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} tracker={selectedTracker} />
    </div>
  );
}
