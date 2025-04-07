// import { Github } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:border-t dark:border-gray-200 py-4">
      <div className="container flex flex-col items-center mx-auto px-4">
        <div className="flex w-full justify-between items-center">
          <p className="text-gray-600">&copy; 2024 LED-UP.</p>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Powered by</span>
            <Image src={'/ngi-logo.png'} alt="NGI Logo" className="h-8" width={100} height={100} />
          </div>
        </div>
        {/* <ul className="flex justify-center space-x-4 w-full gap-3 mt-12 ">
          <li>
            <a
              href="https://github.com/NGI-TRUSTCHAIN/LED-UP"
              className="text-gray-600 hover:text-ngi-pink"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LED-UP GitHub"
            >
              <Github size={20} />
            </a>
          </li>
        </ul> */}
      </div>
    </footer>
  );
};

export default Footer;
