import React from 'react';
import SwaggerComponent from '@/components/SwaggerUI';

const APIDocs: React.FC = () => {
  return (
    <div className="">
      <SwaggerComponent yamlFileUrl="/api.yaml" />
    </div>
  );
};

export default APIDocs;
