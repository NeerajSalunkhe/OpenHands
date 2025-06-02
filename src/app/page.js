'use client';
import Image from "next/image";
import Lottie from "lottie-react";
import Footer from "./components/footer";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { motion } from 'framer-motion';
import Link from "next/link";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid'
export default function Home() {
  const { data: session } = useSession();
  const [animationData, setAnimationData] = useState(null);
  const lottieRef = useRef();
  // ------ Load Lottie file as before ------
  useEffect(() => {
    fetch('/lottie/tea.json')
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);

  // ------ Track previous session so we know when "login" just happened ------
  const prevSessionRef = useRef(null);
  const isFirstCheck = useRef(true);

  useEffect(() => {
    // On first render: just store whatever `session` is, but do NOT fire a toast.
    if (isFirstCheck.current) {
      prevSessionRef.current = session;
      isFirstCheck.current = false;
      return;
    }

    // After first render: if prevSession was null (logged‐out) and now session is truthy, user just logged in.
    if (!prevSessionRef.current && session) {
      const toastKey = `toastShownFor_${session.user?.email}`;
      if (!localStorage.getItem(toastKey)) {
        toast("Use desktop for better experience 🙌", {
          duration: 4000,
          position: 'top-center', // <-- Here
          icon: '💻',
          style: {
            background: '#333',
            color: '#fff',
          },
        });
        localStorage.setItem(toastKey, 'true');
      }
    }
    prevSessionRef.current = session;
  }, [session]);

  const [form, setForm] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/needall');
        const result = await res.json();
        if (res.ok) {
          setForm(result.data);
        } else {
          // toast.error(result.message);
        }
      } catch (error) {
        // toast.error("Fetch error:", error);
      }
    };
    fetchData();
  }, []);

  const router = useRouter();
  // const handleHelpClick = (e) => {
  //   console.log(e);
  //   if (e.email === session?.user?.email) {
  //     toast.error("You cannot help yourself!");
  //     return;
  //   }
  //   const encodedEmail = encodeURIComponent(e.email);
  //   router.push(`/api/person/${encodedEmail}?key=${e.key}`);
  // };
  return (
    <motion.div
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      exit={{ y: -20 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <Toaster /> {/* Toast container */}

      <div
        className="backgrd
          flex flex-col justify-center text-gray-200 gap-10 
          m-0 inset-0 -z-20 h-full w-lvw items-center 
          px-4 md:px-5 
          md:0  
          [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"
      >
        <div className="flex flex-col justify-center items-center mt-20 md:mt-30">
          <div className="font-bold text-3xl md:text-4xl p-4 md:p-6 flex justify-center items-center flex-col gap-4 text-center">
            <div
              onMouseEnter={() => lottieRef.current?.play()}
              onMouseLeave={() => lottieRef.current?.stop()}
              className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 cursor-pointer"
            >
              <div>OpenHands</div>
              <img
                className="w-12 h-12 md:w-20 md:h-20 invert text-white p-2 rounded-full -z-0"
                src="charity.gif"
                alt=""
              />
            </div>
            <div className="text-sm md:text-xs px-4 md:px-0 leading-relaxed max-w-xs md:max-w-md text-center">
              A place where anyone can give, and everyone can receive. No campaigns. No rules. Just kindness.
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-3 w-full md:w-auto px-4">
            {session ? (
              <Link href="/dashboard">
                <button
                  type="button"
                  className="
                    w-full md:w-auto cursor-pointer text-white 
                    bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 
                    hover:bg-gradient-to-br focus:ring-4 focus:outline-none 
                    focus:ring-blue-300 dark:focus:ring-blue-800 
                    shadow-lg shadow-blue-500/50 dark:shadow-lg 
                    dark:shadow-blue-800/80 font-medium rounded-xl 
                    text-sm px-6 py-2.5 text-center mb-2
                  "
                >
                  Get Started
                </button>
              </Link>
            ) : (
              <Link href="/login">
                <button
                  type="button"
                  className="
                    w-full md:w-auto cursor-pointer text-white 
                    bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 
                    hover:bg-gradient-to-br focus:ring-4 focus:outline-none 
                    focus:ring-blue-300 dark:focus:ring-blue-800 
                    shadow-lg shadow-blue-500/50 dark:shadow-lg 
                    dark:shadow-blue-800/80 font-medium rounded-xl 
                    text-sm px-6 py-2.5 text-center mb-2
                  "
                >
                  Get Started
                </button>
              </Link>
            )}

            <Link href="/readmore">
              <button
                type="button"
                className="
                  w-full md:w-auto cursor-pointer text-white 
                  bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 
                  hover:bg-gradient-to-br focus:ring-4 focus:outline-none 
                  focus:ring-blue-300 dark:focus:ring-blue-800 
                  shadow-lg shadow-blue-500/50 dark:shadow-lg 
                  dark:shadow-blue-800/80 font-medium rounded-xl 
                  text-sm px-6 py-2.5 text-center mb-2
                "
              >
                Read More
              </button>
            </Link>
          </div>
        </div>

        <div className="border-1 opacity-30 w-full left-0"></div>
        {
          session && <>
            <div className="w-screen px-50">
              <div className="text-center pt-0 p-5 font-bold text-3xl">
                Needy Persons
              </div>
              <ul className="flex flex-col mx-auto max-w-220 gap-4 text-green-100">
                {
                  form.map((item) => (
                    <li
                      key={uuidv4()}
                      className="flex items-center justify-between max-w-220 p-5 bg-white/20 rounded-4xl px-10"
                    >
                      <div className="flex-1 max-w-md rounded-xl shadow-md p-6 backdrop-blur-lg text-white space-y-4">
                        <div className="text-lg font-bold">Name: {item.name}</div>
                        <div className="text-sm text-gray-300">Email: {decodeURIComponent(item.email)}</div>

                        <div className="flex justify-between font-semibold text-sm">
                          <div className="text-green-300">Required: ₹{item.amount}</div>
                          <div className="text-blue-300">Collected: ₹{item.collected_amount}</div>
                        </div>

                        <div className="text-sm text-gray-200">
                          <span className="font-medium text-white">Message:</span> {item.message}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          console.log(item.email, session?.user?.email);
                          if (item.email.replace(/%40/g, '@') === session?.user?.email) {
                            toast.error("You cannot help yourself!");
                          } else {
                            router.push(`/api/person/${encodeURIComponent(item.email)}?key=${item.key}`);
                          }
                        }}
                        type="button"
                        className="ml-6 cursor-pointer text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                      >
                        Help
                      </button>
                    </li>
                  ))
                }
              </ul>
            </div>
            <div className="border-1 opacity-30 w-full left-0"></div>
          </>
        }
        <div className="flex flex-col justify-center items-center gap-4 px-4 text-center">
          <div className="text-lg md:text-2xl font-bold">Know More</div>
          <div className="w-full flex justify-center">
            <iframe
              className="rounded-2xl md:rounded-4xl border-4 md:border-10 border-black w-full max-w-[90vw] md:max-w-[560px] aspect-video"
              src="https://www.youtube.com/embed/1n7Nse5mMro?si=-v5-eoe62UK26Cw3"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div className="border-1 opacity-30 w-full left-0"></div>

        <div className="w-full px-4 md:px-0 mt-10">
          <Footer />
        </div>
      </div>
    </motion.div>
  );
}
