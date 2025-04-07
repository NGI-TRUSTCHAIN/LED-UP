import React from 'react';
import Header from './header';
import Hero from './hero';
import DocumentationGrid from './documentation';
import Footer from './footer';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100">
      <Header />
      <Hero />
      <DocumentationGrid />
      <div className="flex-grow"></div>
      <Footer />
    </div>
  );
}

export default App;
