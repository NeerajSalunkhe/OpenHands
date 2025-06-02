'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Lottie from 'lottie-react';
import { useSession, signOut } from "next-auth/react";

export default function UserDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [animationData, setAnimationData] = useState(null);
  const lottieRef = useRef();
  const [welcome, setSelcome] = useState(false);
  const { data: session, status } = useSession();

  const handleLogout = () => {
    signOut({
      callbackUrl: '/',
      redirect: true,
    });
  };

  useEffect(() => {
    if (session?.user?.name) {
      setSelcome(true)
    } else {
      setSelcome(false)
    }
  }, [session]);

  useEffect(() => {
    fetch('/lottie/user.json')
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [user1, setUser] = useState({
    image: session?.user?.image,
    username: '',
  });

  useEffect(() => {
    if (!session?.user?.email) return;
    async function fetchUser() {
      const res = await fetch(`/api/user/${session.user.email}`);
      const data = await res.json();
      setUser({
        image: data.profilephoto || session?.user?.image,
        username: data.username || session?.user?.name,
      });
    }
    fetchUser();
  }, [session]);

  return (
    <div
      className="relative inline-block text-left z-10"
      ref={dropdownRef}
    >
      <button
        className="
          flex items-center text-sm pe-1 font-medium text-gray-900 
          rounded-full hover:text-blue-600 dark:hover:text-black 
          dark:text-white gap-3
        "
        type="button"
        onClick={() => setOpen(!open)}
      >
        <span className="sr-only">Open user menu</span>
        <div className="flex justify-center items-center gap-3">
          <Image
            src={user1.image || '/default.png'}
            alt="User profile"
            width={40}
            height={40}
            className="rounded-full cursor-pointer"
          />
          <div className="cursor-pointer">{user1.username}</div>
        </div>
        <svg
          className="w-2.5 h-2.5 ms-3 cursor-pointer"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M1 1l4 4 4-4"
          />
        </svg>
      </button>

      {open && (
        <div
          className="
            absolute right-0 
            mt-2 
            bg-white divide-y divide-gray-100 
            rounded-lg shadow-sm 
            w-full sm:w-44 
            dark:bg-blue-950 dark:divide-gray-600
          "
        >
          <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
            <div className="truncate">{session?.user?.email}</div>
          </div>
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
            <li>
              <Link
                href="/dashboard"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/details"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Details
              </Link>
            </li>
          </ul>
          <div className="py-2">
            <div
              onClick={handleLogout}
              className="
                cursor-pointer block px-4 py-2 text-sm 
                text-gray-700 hover:bg-gray-100 
                dark:hover:bg-gray-600 dark:text-gray-200 
                dark:hover:text-white
              "
            >
              Sign out
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
