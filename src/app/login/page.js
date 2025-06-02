'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession, signIn } from "next-auth/react";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
    const { data: session } = useSession();
    const [from, setFrom] = useState('/');
    const router = useRouter();
    const [clicked, setClicked] = useState(false);

    useEffect(() => {
        if (session) {
            router.push('/');
        }
    }, [session]);

    const providers = [
        ['https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg', 'Google'],
    ];

    const handleClick = (providerName) => {
        if (providerName === 'Google') {
            setClicked(!clicked);
            signIn('google', {
                callbackUrl: '/dashboard',
                prompt: 'login'
            });
        }
    };

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="flex items-center justify-center h-screen font-poppins dark:bg-gray-900 px-4 ">
                <div className="grid gap-8 w-full max-w-[500px] md:max-w-none">
                    <div className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-[26px] m-2 md:m-4 flex flex-col justify-center items-center w-full md:w-auto">
                        <div className='pt-10 md:pt-15 text-3xl md:text-5xl font-bold text-gray-300 text-center'>
                            LOGIN
                        </div>
                        <div className="flex items-center justify-center mt-5 flex-col gap-6 md:gap-10 pt-6 md:pt-10 p-6 md:p-20 w-full">
                            {providers.map(([src, alt]) => (
                                <button
                                    key={alt}
                                    onClick={() => handleClick(alt)}
                                    className="cursor-pointer bg-gradient-to-r p-4 md:p-5 from-blue-500/70 to-purple-500/70 hover:scale-105 duration-300 shadow-lg rounded-4xl w-full md:w-100 flex items-center"
                                    type="button"
                                >
                                    <Image
                                        src={src}
                                        alt={alt}
                                        width={25}
                                        height={25}
                                        className={`rounded-full w-8 h-8`}
                                    />
                                    <div className='ml-4 font-bold text-gray-300 text-xl md:text-2xl'>
                                        {alt}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
