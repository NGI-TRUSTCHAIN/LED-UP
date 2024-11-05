import { getProducerRecordCount, readLatestCompletedRecord, getProducerRecords } from '@/lib/actions/file';
import UploadModal from './upload-modal';
import Download from './download';
import ViewModal from './view-modal';

export default async function FilesPage() {
  const { data } = await readLatestCompletedRecord();

  let filteredData = data;

  const handleFilter = (eName: string) => {
    filteredData = data.filter((record: any) => record.eName === eName);
  };

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
                      <a
                        href={JSON.parse(record.args)[3]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Open
                      </a>
                    </td>
                    <td className="py-4 px-2">
                      <ViewModal data={record} />
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`https://sepolia.etherscan.io/block/${record.blockNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
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
