'use client'
import Image from 'next/image';
import React from 'react'
import { useEffect, useState, useRef } from 'react';
import { useSession } from "next-auth/react";
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import TransitionOverlay from '../components/TransitionOverlay';
import FadeInSection from '../components/FadeInSection';
import { v4 as uuidv4 } from 'uuid'
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast,{Toaster} from 'react-hot-toast';
const Dashboard = () => {
    const [animationData, setAnimationData] = useState(null);
    const lottieRef = useRef();
    useEffect(() => {
        fetch('/lottie/user.json')
            .then((res) => res.json())
            .then(setAnimationData);
    }, []);

    const [animationData2, setAnimationData2] = useState(null);
    const lottieRef2 = useRef();
    useEffect(() => {
        fetch('/lottie/support.json')
            .then((res) => res.json())
            .then(setAnimationData2);
    }, []);

    const { data: session, status } = useSession();
    const [user1, setUser] = useState({
        image: session?.user?.image,
        username: session?.user.image,
        followers: [],
        earned: 0,
    });
    useEffect(() => {
        if (!session?.user?.email) return;
        async function fetchUser() {
            const res = await fetch(`/api/user/${session.user.email}`);
            const data = await res.json();
            setUser({
                image: data.profilephoto || session?.user?.image,
                username: data.username || session?.user?.name,
                followers: data.followers || [],
                earned: data.earned || 0,
            });
        }
        fetchUser();
    }, [session]);

    const [toshow, setShow] = useState([]);

    useEffect(() => {
        if (!session) return;
        async function fetchPayments() {
            try {
                const res = await fetch(`/api/paysearch?query=${encodeURIComponent(session?.user?.email)}`);
                if (!res.ok) return;
                const data = await res.json();
                setShow(data);
            } catch (error) {
                toast.error('Error fetching payments:', error);
            }
        }
        fetchPayments();
        // console.log(toshow);
        // console.log(session?.user?.email);
    }, [session]);

    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        message: '',
        amount: '',
    });

    const handleAdd = async () => {
        const { name, message, amount } = formData;
        const collected_amount = 0;
        const supporters=[]
        let eml = encodeURIComponent(session?.user?.email?.toLowerCase() || '');
        eml.replace(/%40/g,'@')
        if (!name || !message || !amount) {
            toast.error('All fields are required!');
            return;
        }

        if (isNaN(Number(amount)) || Number(amount) < 50) {
            toast.error('Please enter a valid amount greater than 49');
            return;
        }
        setIsAdding(true);
        try {
            const response = await fetch(`/api/addneed/${eml}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    key: uuidv4(),
                    name,
                    email: eml,
                    message,
                    amount,
                    collected_amount,
                    supporters,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                toast.error(err.message || 'Failed to add need');
            } else {
                toast.success('Need added successfully!');
                setFormData({ name: '', message: '', amount: '' });
            }
        } catch (error) {
            toast.error('Something went wrong!');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <motion.div
            initial={{ y: 20 }} // starting point
            animate={{ y: 0 }}  // ending point
            exit={{ y: -20 }}   // exit animation
            transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
            <div className='dashboard flex flex-col justify-center text-gray-200 gap-10 m-0 inset-0 -z-10 min-h-screen h-full w-full items-center px-5 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] p-10'>
                <div className='flex flex-col justify-center items-center mt-25 gap-2'>
                    <div>
                        <Image
                            src={user1.image || 'https://cdn.pixabay.com/photo/2018/04/18/18/56/user-3331256_1280.png'}
                            alt="Profile"
                            width={35}
                            height={35}
                            className="border-3 border-white w-35 h-35 rounded-full"
                        />
                    </div>
                    <FadeInSection>
                        <div className='font-bold text-3xl'>@{user1.username}</div>
                    </FadeInSection>
                    <div className='flex flex-col justify-center items-center gap-1 text-gray-400'>
                        <div className='text-xl'>{session?.user?.email}</div>
                        <div className='text-xs flex gap-1'>
                            <div>{user1.followers?.length} followers . </div>
                            <div>{user1.earned} ₹ Collected</div>
                        </div>
                        <div className='flex p-1 justify-center items-center'>
                            <Link href={`/api/follower/${session?.user?.email}`} type="button" className="m-2 ml-3 text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 shadow-lg shadow-pink-500/50 dark:shadow-lg dark:shadow-pink-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 w-28">
                                followers
                            </Link>
                            <Link href={`/api/following/${session?.user?.email}`} type="button" className="m-2 ml-3 text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 shadow-lg shadow-pink-500/50 dark:shadow-lg dark:shadow-pink-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 w-28">
                                following
                            </Link>
                        </div>
                    </div>
                </div>
                <div className='support flex w-auto min-w-xl max-w-2xl justify-center align-center gap-5'>
                    <div className="payment h-100 w-full min-w-xl md:w-xl bg-white/10 rounded-4xl p-5 md:p-10 flex flex-col items-center gap-4">
                        <div className="font-bold text-xl">Add Need </div>
                        <div className="flex flex-col justify-center items-center gap-2">
                            <input
                                type="text"
                                placeholder="Enter Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full h-12 rounded-2xl bg-blue-950 px-3 text-white"
                            />
                            <input
                                type="text"
                                placeholder="Enter Message"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full h-12 rounded-2xl bg-blue-950 px-3 text-white"
                            />
                            <input
                                type="number"
                                placeholder="Enter Amount"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full h-12 rounded-2xl bg-blue-950 px-3 text-white"
                            />
                            <div className="pt-1 w-full">
                                <button
                                    type="button"
                                    onClick={handleAdd}
                                    disabled={isAdding}
                                    className={`cursor-pointer rounded-2xl w-full text-white font-medium text-sm px-5 py-2.5 text-center me-2 mb-2 h-12 ${false
                                        ? 'bg-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700'
                                        }`}
                                >
                                    {isAdding ? 'Processing...' : `Add`}
                                </button>
                            </div>
                        </div>
                    </div>
                    <FadeInSection>
                        <div className='supporters flex flex-col min-h-100 min-w-xl overflow-auto bg-white/10 rounded-4xl pt-5 pb-10 pr-10 pl-10 text-gray-300'>
                            <div className='mx-auto pb-2 font-bold text-2xl flex justify-center items-center'>
                                <div>
                                    <Lottie
                                        className="w-13 h-13 text-white p-2 rounded-full "
                                        animationData={animationData2}
                                        loop
                                        lottieRef={lottieRef2}
                                    />
                                </div>
                                <div className=''>
                                    Supporters
                                </div>
                            </div>
                            <ul className='py-3 flex flex-col gap-1'>
                                {toshow.map((item) => (
                                    <li key={uuidv4()} className='flex items-center gap-2'>
                                        {animationData && (
                                            <Lottie
                                                className="w-10 h-10 text-white p-2 rounded-full"
                                                animationData={animationData}
                                                loop
                                                lottieRef={lottieRef}
                                            />
                                        )}
                                        <div>{item.name} sent ₹{item.amount} with message : {item.message}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </FadeInSection>
                </div>
            </div>
        </motion.div>

    )
}

export default Dashboard