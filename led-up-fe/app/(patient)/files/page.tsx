'use client';

import { useState, useEffect } from 'react';
import UploadModal from './upload-modal';
import Download from './download';
import ViewModal from './view-modal';
import { readLatestCompletedRecordClient } from '@/lib/actions/file-client';

export default function FilesPage() {
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data client-side
    const fetchData = async () => {
      try {
        // Use our client-side function
        const { data } = await readLatestCompletedRecordClient();

        setAllData(data);
        setFilteredData(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();

    // Set up periodic refresh
    const refreshInterval = setInterval(fetchData, 10000); // Refresh every 10 seconds

    // Clean up on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const handleFilter = (eName: string) => {
    if (!eName) {
      setFilteredData(allData);
      return;
    }

    setFilteredData(allData.filter((record: any) => record.eName === eName));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <p className="text-center mt-4">Loading files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error</h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="relative overflow-x-auto shadow-sm sm:rounded-lg border">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <caption className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-2xl">Uploaded Files</h2>
                  <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                    Browse a list of previously uploaded files
                  </p>
                </div>
                <UploadModal />
              </div>
            </caption>
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Event
                </th>
                <th scope="col" className="px-6 py-3">
                  CID
                </th>
                <th scope="col" className="px-6 py-3">
                  Details
                </th>
                <th scope="col" className="px-6 py-3">
                  Blockchain URL
                </th>
                <th scope="col" className="px-6 py-3">
                  <span className="sr-only">Download</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((record: any) => {
                return (
                  <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={record.id}>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {record.eName}
                    </th>
                    <td className="px-6 py-4">
                      {(() => {
                        try {
                          const args = JSON.parse(record.args);
                          const ipfsUrl = args[3];
                          if (ipfsUrl && ipfsUrl.startsWith('ipfs://')) {
                            const cid = ipfsUrl.replace('ipfs://', '');
                            return (
                              <a
                                href={`https://gateway.pinata.cloud/ipfs/${cid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {cid.substring(0, 10)}...
                              </a>
                            );
                          }
                          return ipfsUrl || 'N/A';
                        } catch (e) {
                          return 'Invalid format';
                        }
                      })()}
                    </td>
                    <td className="py-4 px-2">
                      <ViewModal data={record} />
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`https://localhost:8545/block/${record.blockNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {record.blockNumber}
                      </a>
                    </td>
                    <Download record={record} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

/* <div className="overflow-x-auto relative shadow-md sm:rounded-lg"> 
      <Table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <TableCaption className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                  Uploaded Files
                  <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                    Browse a list of Flowbite products designed to help you work and play, stay organized, get answers, keep
                    in touch, grow your business, and more.
                  </p>
                </TableCaption>
                <TableHeader className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
                  <TableRow className="bg-gray-100 border-b dark:bg-gray-800 dark:border-gray-700">
                    <TableHead scope="col" className="px-6 py-3">
                      File Name
                    </TableHead>
                    <TableHead className="px-6 py-3 hidden sm:table-cell">CID</TableHead>
                    <TableHead scope="col" className="px-6 py-3">
                      Blockchain URL
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="px-6 py-4">{file.name}</TableCell>
                      <TableCell className="hidden sm:table-cell px-6 py-4">{file.cid}</TableCell>
                      <TableCell className="px-6 py-4">
                        <a
                          href={file.blockchainUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
        </div> 
        */
