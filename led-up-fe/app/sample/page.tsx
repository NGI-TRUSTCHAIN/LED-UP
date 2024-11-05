import { listFiles, getRecord } from '@/lib/actions/file';
import React from 'react';
import ConnectButton from './connect';
import MyComponent from './account';

const Page = async () => {
  const files = await listFiles();
  const record = await getRecord();

  return (
    <div>
      Page
      <ConnectButton />
      <MyComponent />
    </div>
  );
};

export default Page;
