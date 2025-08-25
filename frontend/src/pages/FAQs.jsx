import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FAQs = () => {
  const items = [
    { q: 'Do you provide installation?', a: 'Yes, professional installation is available in supported cities.' },
    { q: 'What are your service hours?', a: 'Mon-Sat 10AM - 7PM IST.' },
  ];
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">FAQs</h1>
        <div className="space-y-4">
          {items.map((it, i) => (
            <div key={i} className="bg-white p-4 rounded-md shadow-sm">
              <h2 className="font-semibold">{it.q}</h2>
              <p className="text-gray-700">{it.a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQs;

