import React from 'react';
import { BookOpen, Database, Zap, Globe, Code2Icon } from 'lucide-react';
import { GitHubIcon } from 'nextra/icons';
import Link from 'next/link';

const sections = [
  {
    title: 'Introduction',
    icon: BookOpen,
    description:
      'You will get a general introduction about LED-UP and how it works. And also, it has the links for documentation sections',
    href: '/introduction',
  },
  {
    title: 'Smart Contract',
    icon: Code2Icon,
    description: 'In this section, you will get a brief overview of how to install the LED-UP Platform.',
    href: '/contracts/getting-started',
  },
  {
    title: 'API Docs',
    icon: Database,
    description: 'This section will contain a brief overview of the APIs that are available in the LED-UP Platform.',
    href: '/api-docs/setting-the-development-environment',
  },
  {
    title: 'Repository',
    icon: GitHubIcon,
    description: 'The repository will contain the code for the smart contracts, the API, and the documentation.',
    href: 'https://github.com/NGI-TRUSTCHAIN/LED-UP',
  },
  {
    title: 'Utilities',
    icon: Zap,
    description:
      'This section will contain a brief overview of the utilities that are available in the LED-UP Platform.',
    href: '#',
  },
  {
    title: 'Web',
    icon: Globe,
    description: 'This is the documentation for the web version of the LED-UP Platform.',
    href: '#',
  },
];

const DocumentationGrid = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.map((section, index) => (
          <Link
            href={section.href}
            key={index}
            className="bg-white  rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300"
          >
            <section.icon className="text-ngi-pink  mb-4" size={32} />
            <h2 className="text-xl font-semibold mb-2 text-ngi-pink ">{section.title}</h2>
            <p className="text-gray-600 ">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DocumentationGrid;
