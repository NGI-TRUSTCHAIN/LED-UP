import Link from 'next/link';
import { Cards, Callout } from 'nextra/components';
import React from 'react';
import FAQs from './faqs';

const Category = () => {
  return (
    <>
      <Cards num={2}>
        <Link href="/contracts/getting-started" className="font-bold">
          <Callout type="info" emoji="💻">
            Smart Contract Docs
          </Callout>
        </Link>
        <Link href="/api-docs/setting-the-development-environment" className="font-bold">
          <Callout type="info" emoji="🔌">
            API Docs
          </Callout>
        </Link>
      </Cards>
      <FAQs />
    </>
  );
};

export default Category;
