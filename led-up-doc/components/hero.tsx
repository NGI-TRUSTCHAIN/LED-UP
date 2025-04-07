import React from 'react';

import Link from 'next/link';

const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-[#020024]  via-[#01688f] to-[#020024]  py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          LED-UP Safe Healthcare Transaction Platform Documentation
        </h1>
        <p className="text-lg lg:text-xl text-white mb-8 ">
          A fully decentralized healthcare platform that provides secure and efficient healthcare services.
        </p>
        <div className="max-w-2xl mx-auto relative mt-12">
          {/* <input
            type="text"
            placeholder="Search the docs..."
            className="w-full py-3 px-4 pr-12 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-ngi-pink"
          />
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /> */}
          <Link
            className="bg-white text-ngi-pink  py-3 lg:py-4 text-lg px-8 rounded-full  hover:bg-ngi-pink hover:text-white hover:ring-ngi-pink min-w-56 md:px-12 transition-all duration-300"
            href={'/introduction'}
          >
            Go to Documentation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
