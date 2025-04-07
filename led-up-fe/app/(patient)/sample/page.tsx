'use client';

import React, { useEffect } from 'react';
import ConnectButton from './connect';
import MyComponent from './account';

const Page = () => {
  // const [files, setFiles] = useState([]);
  // const [record, setRecord] = useState(null);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't fetch during build - leave it for client-side only
    // This avoids errors during static site generation
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sample Page</h1>
      <ConnectButton />
      <MyComponent />
    </div>
  );
};

export default Page;
