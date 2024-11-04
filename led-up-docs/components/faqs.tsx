import { ChevronDown, ChevronUp } from 'lucide-react';
import { Code } from 'nextra/components';
import React, { useState } from 'react';
const faqs = [
  {
    id: 1,
    q: 'What are the prerequisites for setting up the LED-UP Platform API?',
    a: 'The prerequisites include Node.js 18.x or later, TypeScript 4.x or later, a deployed LED-UP Smart Contract, IPFS Node (or Pinata, Infura), Visual Studio Code, Azure Functions Core Tools, Azure Functions Extension, and Git.',
  },
  {
    id: 2,
    q: 'How do I clone the LED-UP Platform API repository?',
    a: (
      <div>
        <p></p> You can clone the repository using the following commands:
        <Code className="flex flex-col p-4">
          <span>git clone https://github.com/NGI-TRUSTCHAIN/LED-UP/tree/master/DATA_REGISTRY_SC_API</span>
          <span>cd DATA_REGISTRY_SC_API</span>
        </Code>
      </div>
    ),
  },
  {
    id: 3,
    q: 'How do I install the dependencies for the LED-UP Platform API?',
    a: 'Navigate to the project directory and run the command:  npm install',
  },
  {
    id: 4,
    q: 'What environment variables are required for the LED-UP Platform API?',
    a: 'The project requires environment variables like ALCHEMY_API_KEY, AzureWebJobsStorage, DB_SERVER, PRIVATE_KEY, and more. These should be added to the local.settings.json file.',
  },
  {
    id: 5,
    q: 'How do I run the LED-UP Platform API locally?',
    a: 'You can run the API locally by using the command:  npm start',
  },
  {
    id: 6,
    q: 'How do I deploy the LED-UP Platform API to Azure?',
    a: 'First, log in to Azure using `az login`, then create a resource group, a function app, and deploy the application using `npm run deploy`.',
  },
  {
    id: 7,
    q: 'How do I clone the LED-UP Smart Contracts repository?',
    a: 'Run the following commands to clone the repository:  git clone https://github.com/NGI-TRUSTCHAIN/LED-UP/tree/master/LED-UP-SMART-CONTRACTS  cd LED-UP-SMART-CONTRACTS',
  },
  {
    id: 8,
    q: 'How do I install Foundry for working with smart contracts?',
    a: 'To install Foundry, run the command:  curl -L https://foundry.paradigm.xyz | bash  followed by `foundryup` to keep it updated.',
  },
];

const FAQs = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  const handleExpand = (id: number) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <section className="mt-16 animate-fade-in">
      <h2 className="text-3xl font-bold mb-8">Quick FAQs</h2>
      <div className="grid grid-cols-1 gap-6">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all duration-300 shadow"
          >
            <h3 className="text-xl font-semibold mb-2 flex justify-between items-center">
              {faq.q}
              <button onClick={() => handleExpand(faq.id)} aria-label="Toggle FAQ">
                {expanded === faq.id ? (
                  <ChevronUp size={20} className="text-teal-400" />
                ) : (
                  <ChevronDown size={20} className="text-teal-400" />
                )}
              </button>
            </h3>
            {expanded === faq.id && <p className="text-gray-500 transition-all duration-300 ">{faq.a}</p>}
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
        <a
          href="#"
          className="text-blue-950 hover:text-blue-800 transition-colors duration-300 flex items-center justify-center"
        >
          View all FAQs
          <ChevronDown size={20} className="ml-2" />
        </a>
      </div>
    </section>
  );
};

export default FAQs;
