'use client'
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Lottie from 'lottie-react';
import { useSession, signOut } from "next-auth/react";
import Dropdown from './dropdown';
import Searchbar from './searchbar';

export default function Header() {
  const [animationData, setAnimationData] = useState(null);
  const lottieRef = useRef();

  useEffect(() => {
    fetch('/lottie/money.json')
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);

  const { data: session, status } = useSession();
  const handleLogout = () => {
    signOut({
      callbackUrl: '/',
      redirect: true,
    });
  };

  return (
    <div className="navibar flex justify-center">
      <header
        className="
          fixed top-4 
          w-full md:w-300 
          px-4 md:px-30 
          bg-gradient-to-br from-purple-600/70 to-blue-500/70 
          rounded-4xl 
          text-gray-600 body-font 
          z-50
        "
      >
        <div className="container mx-auto flex flex-col md:flex-row items-center p-3">
          <Link
            href="/"
            className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0"
          >
            {animationData && (
              <Lottie
                className="w-12 h-12 md:w-16 md:h-16 text-white p-2 rounded-full"
                animationData={animationData}
                loop={true}
                lottieRef={lottieRef}
              />
            )}
            <span
              className="
                ml-3 text-lg md:text-xl text-gray-200 
                hover:text-transparent hover:bg-clip-text 
                hover:bg-gradient-to-bl hover:from-purple-600 
                hover:to-blue-500 transition-all duration-300
              "
            >
              OpenHands
            </span>
          </Link>

          <nav className="hidden md:flex text-gray-400 mr-auto ml-4 py-1 pl-4 border-l border-gray-400 text-base justify-center">
            {/* (Empty for now; add nav links here if needed) */}
          </nav>

          {!session ? (
            <Link
              href="/login"
              className="mainpage
                text-white bg-gradient-to-br from-purple-600 to-blue-500 
                hover:bg-gradient-to-bl focus:ring-4 focus:outline-none 
                focus:ring-blue-300 dark:focus:ring-blue-800 
                font-medium rounded-3xl text-sm 
                px-5 py-3 text-center 
                mb-2 w-full md:w-auto
                flex justify-center items-center
              "
            >
              Login / Sign Up
            </Link>
          ) : (
            <div className="mainpage flex flex-col md:flex-row justify-center md:justify-baseline gap-5 w-full md:w-auto mt-4 md:mt-0">
              <Searchbar />
              <Dropdown />
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
