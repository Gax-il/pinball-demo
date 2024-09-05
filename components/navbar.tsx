import { IconMenu2 } from "@tabler/icons-react";
import Image from "next/image";
import React, { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <a href="#" className="text-xl font-bold text-gray-800">
            <Image src="/logo.png" alt="Pinball" width={100} height={100} />
          </a>
        </div>

        <div className="hidden md:flex space-x-6">
          <a
            href="#"
            className="text-gray-800 hover:text-blue-500 text-base md:text-lg lg:text-xl"
          >
            Domov
          </a>
          <a
            href="#"
            className="text-gray-800 hover:text-blue-500 text-base md:text-lg lg:text-xl"
          >
            Účty
          </a>
          <a
            href="#"
            className="text-gray-800 hover:text-blue-500 text-base md:text-lg lg:text-xl"
          >
            Zařízení
          </a>
          <a
            href="#"
            className="text-gray-800 hover:text-blue-500 text-base md:text-lg lg:text-xl"
          >
            Administrace
          </a>
          <a
            href="#"
            className="text-gray-800 hover:text-blue-500 text-base md:text-lg lg:text-xl"
          >
            Podpora
          </a>
        </div>

        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            type="button"
            className="text-gray-800 hover:text-blue-500 focus:outline-none"
          >
            <IconMenu2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <a
            href="#"
            className="block px-4 py-2 text-gray-800 hover:text-blue-500"
          >
            Home
          </a>
          <a
            href="#"
            className="block px-4 py-2 text-gray-800 hover:text-blue-500"
          >
            About
          </a>
          <a
            href="#"
            className="block px-4 py-2 text-gray-800 hover:text-blue-500"
          >
            Services
          </a>
          <a
            href="#"
            className="block px-4 py-2 text-gray-800 hover:text-blue-500"
          >
            Contact
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
