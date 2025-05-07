// components/Footer.tsx

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Footer Left: Brand Name or Logo */}
          <div className="text-lg font-semibold">MyApp</div>

          {/* Footer Links */}
          <div className="space-x-6 flex">
            <a href="#home" className="hover:text-gray-400 transition-colors duration-300 ease-in-out">Home</a>
            <a href="#about" className="hover:text-gray-400 transition-colors duration-300 ease-in-out">About</a>
            <a href="#services" className="hover:text-gray-400 transition-colors duration-300 ease-in-out">Services</a>
            <a href="#contact" className="hover:text-gray-400 transition-colors duration-300 ease-in-out">Contact</a>
          </div>
        </div>

        {/* Footer Bottom: Copyright */}
        <div className="mt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} MyApp. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
