'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

export default function SearchForm() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const containerRef = useRef(null);
  const timeoutRef = useRef();
  const { data: session } = useSession();

  // Fetch suggestions
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();

      const filtered = data.filter(item => item.email !== session?.user?.email);
      setSuggestions(filtered);
      setShowSuggestions(true);
    }, 300);
  }, [query, session?.user?.email]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Redirect on search (only if user exists)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const match = suggestions.find(
      (user) =>
        user.email.toLowerCase() === query.toLowerCase() ||
        user.username.toLowerCase() === query.toLowerCase()
    );
    if (match) {
      router.push(`/api/person/${encodeURIComponent(match.email)}`);
    } else {
      toast.error('User not found!');
    }
  };

  // Redirect when selecting from dropdown
  const handleSelect = (email) => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    router.push(`/api/person/${encodeURIComponent(email)}`);
  };

  return (
    <>
      <Toaster position="top-center" />
      <div ref={containerRef} className="relative w-full max-w-sm mx-auto z-10">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center sm:items-stretch gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search username or email..."
            className="
              w-full sm:flex-1 
              p-2 rounded-xl 
              bg-blue-800/70 text-white 
              focus:outline-none focus:ring-2 focus:ring-blue-300
            "
            onFocus={() => query && setShowSuggestions(true)}
          />
          <button
            type="submit"
            className="
              text-white bg-gradient-to-r from-purple-500/70 to-pink-500/70 
              hover:bg-gradient-to-l focus:ring-4 focus:outline-none 
              focus:ring-purple-200 dark:focus:ring-purple-800 
              font-medium rounded-xl text-sm 
              px-5 py-2.5 text-center 
              w-full sm:w-auto
            "
          >
            Search
          </button>
        </form>

        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute bg-blue-800/80 text-white w-full border mt-1 rounded-2xl shadow z-20">
            {suggestions.map((user) => (
              <li
                key={user.email}
                onClick={() => handleSelect(user.email)}
                className="
                  p-2 rounded-2xl hover:bg-pink-500/70 hover:text-black 
                  transition-all duration-200 cursor-pointer flex items-center gap-2
                "
              >
                <img
                  src={user.profilephoto || '/default.png'}
                  alt="pfp"
                  className="w-6 h-6 rounded-full"
                />
                <div>
                  <div className="font-semibold">{user.username}</div>
                  <div className="text-xs">{user.email}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
