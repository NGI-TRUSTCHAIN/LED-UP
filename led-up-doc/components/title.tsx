import { GitHubIcon } from 'nextra/icons';
import React from 'react';

const HeaderTitle = ({ title, source }: { title: string; source?: string }) => {
  return (
    <div className="flex items-center justify-between mt-4">
      <h1 className="text-3xl font-bold">{title}</h1>
      {source && (
        <a href={source} target="_blank">
          <GitHubIcon />
        </a>
      )}
    </div>
  );
};

export default HeaderTitle;
