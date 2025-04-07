'use client';
import { Button } from '@/components/ui/button';
import { retrieveFileClient } from '@/lib/actions/file-client';
import { DownloadIcon } from 'lucide-react';
import React from 'react';

const Download = ({ record }: any) => {
  const download = async (link: string) => {
    const cid = link.split('/').pop();

    // const file = await retrieveFile(cid as string);
    const data = await fetch(link);
    const file = await data.json();
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cid}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  return (
    <td className="px-6 py-4">
      <Button
        variant="ghost"
        onClick={() => download(JSON.parse(record.args)[3])}
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline flex items-center gap-2"
      >
        <DownloadIcon className="w-4 h-4" />
        Download
      </Button>
    </td>
  );
};

export default Download;
