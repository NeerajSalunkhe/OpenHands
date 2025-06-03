'use client'

import { useParams } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'
import Lottie from 'lottie-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import FadeInSection from '@/app/components/FadeInSection'
import FollowButton from '@/app/components/followbutton'
import { useSession } from 'next-auth/react'
import Script from 'next/script'
import { initiate } from '../../../../../actions/useractions'
import { toast, Toaster } from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
const Dashboard = () => {
    const params = useParams()
    const email = Array.isArray(params?.email) ? params.email[0] : params?.email
    const { data: session } = useSession()

    const [loading, setLoading] = useState(true)
    const [animationData, setAnimationData] = useState(null)
    const lottieRef = useRef(null)

    const [animationData2, setAnimationData2] = useState(null);
    const lottieRef2 = useRef();
    const qry = useSearchParams();
    const key_idd = qry.get("key");
    const [need, setNeed] = useState(null);
    useEffect(() => {
        fetch('/lottie/support.json')
            .then((res) => res.json())
            .then(setAnimationData2);
    }, []);

    const [user1, setUser] = useState({
        image: 'https://cdn.pixabay.com/photo/2018/04/18/18/56/user-3331256_1280.png',
        email: '',
        username: '',
        followers: [],
        razorpayid: '',
        razorpaysecret: '',
        earned: 0,
    })

    const [formData, setFormData] = useState({
        name: '',
        message: '',
        amount: '',
    })

    const [isPaying, setIsPaying] = useState(false)

    useEffect(() => {
        fetch('/lottie/user.json')
            .then((res) => res.json())
            .then(setAnimationData)
    }, [])

    useEffect(() => {
        async function fetchUser() {
            const res = await fetch(`/api/user/${email}`)
            const data = await res.json()
            if (data.email) {
                setUser({
                    image: data.profilephoto || '',
                    email: data.email || '',
                    username: data.username || '',
                    followers: data.followers || [],
                    razorpayid: data.razorpayid,
                    razorpaysecret: data.razorpaysecret,
                    earned: data.earned || 0,
                })
            }
        }
        if (email) fetchUser()
    }, [email])

    const handlePay = async () => {
        const { name, message, amount } = formData;

        if (!name || !message || !amount) {
            toast.error('All fields are required!');
            return;
        }

        if (isNaN(Number(amount)) || Number(amount) < 50) {
            toast.error('Please enter a valid amount greater than 49');
            return;
        }

        if (!user1.razorpayid || !user1.razorpaysecret) {
            toast.error('This user has not set up payments yet.');
            return;
        }

        const fetchNeedAndUpdate = async () => {
            if (!key_idd) return;
            try {
                const res = await fetch(`/api/addneed/${encodeURIComponent(email)}?key=${key_idd}`);
                const data = await res.json();

                if (!res.ok) {
                    toast.error(data.message || "Failed to fetch need");
                    setNeed(null);
                    return;
                }

                const updatedNeed = data.data;

                const response = await fetch(`/api/addneed/${encodeURIComponent(email)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        key: updatedNeed.key,
                        name: updatedNeed.name,
                        email: updatedNeed.email,
                        message: updatedNeed.message,
                        amount: updatedNeed.amount,
                        collected_amount: Number(updatedNeed.collected_amount) + Number(amount),
                        supporters: [
                            ...(updatedNeed.supporters || []),
                            `${formData.name} sends ${formData.amount} with ${formData.message}`
                        ],
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    toast.error(result.message || "Update failed");
                } else {
                    toast.success("Donation successful");
                    setNeed(updatedNeed);
                }
            } catch (err) {
                toast.error("Something went wrong");
            }
        };
        try {
            setIsPaying(true);

            const order = await initiate(amount, formData, email, user1.razorpayid, user1.razorpaysecret);

            const options = {
                key: user1.razorpayid,
                amount: order.amount,
                currency: 'INR',
                name: name,
                description: message,
                image: 'https://example.com/your_logo',
                order_id: order.id,
                callback_url: 'https://eneqd3r9zrjok.x.pipedream.net/',
                prefill: {
                    name: name,
                    email: email || 'anonymous@example.com',
                    contact: '0000000000',
                },
                notes: {
                    message: message,
                },
                theme: {
                    color: '#3399cc',
                },
                handler: async function () {
                    const updatedUser = {
                        ...user1,
                        earned: user1.earned + Number(amount),
                    };
                    setUser(updatedUser);
                    await fetch(`/api/user/${email}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedUser),
                    });
                    setFormData({ name: '', message: '', amount: '' });
                    await fetchNeedAndUpdate();
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
            rzp.on('payment.failed', function () {
                toast.error('Payment failed. Please try again.');
            });
        } catch (err) {
            toast.error('An error occurred while initiating the payment.');
        } finally {
            setIsPaying(false);
        }
    };

    const [toshow, setShow] = useState([]);

    useEffect(() => {
        if (!email) return;
        async function fetchPayments() {
            try {
                const res = await fetch(`/api/paysearch?query=${encodeURIComponent(email)}`);
                if (!res.ok) {
                    toast.error('Failed to fetch payment data');
                    return;
                }
                const data = await res.json();
                setShow(data);
            } catch (error) {
                toast.error('An error occurred while loading supporters');
            }
        }
        fetchPayments();
    }, [user1]);

    return (
        <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            exit={{ y: -20 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
            {/* <Toaster position='top-center'/> */}
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className=" flex flex-col justify-center text-gray-200 gap-10 m-0 inset-0 -z-10 min-h-screen h-full w-full items-center px-5 p-5 md:p-10 pt-30 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]">
                <div className="flex flex-col justify-center items-center mt-25 gap-2">
                    <Image
                        src={user1.image}
                        alt="Profile"
                        width={35}
                        height={35}
                        className="border-3 border-white w-20 h-20 md:w-35 md:h-35 rounded-full"
                    />
                    <FadeInSection>
                        <div className="font-bold text-2xl md:text-3xl">@{user1.username}</div>
                    </FadeInSection>
                    <div className="flex flex-col justify-center items-center gap-1 text-gray-400">
                        <div className="text-base md:text-xl">{user1.email}</div>
                        <div className="text-xs flex gap-1">
                            <div>{user1.followers?.length} followers ·</div>
                            <div>{user1.earned} ₹ Collected</div>
                        </div>
                        <div className='flex justify-center'>
                            <FollowButton viewerEmail={encodeURIComponent(session?.user?.email)} targetEmail={encodeURIComponent(email)} />
                            <Link href={`/api/follower/${email}`} type="button" className="m-2 ml-3 text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 shadow-lg shadow-pink-500/50 dark:shadow-lg dark:shadow-pink-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 w-28">
                                followers
                            </Link>
                            <Link href={`/api/following/${email}`} type="button" className="m-2 ml-3 text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 shadow-lg shadow-pink-500/50 dark:shadow-lg dark:shadow-pink-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 w-28">
                                following
                            </Link>
                        </div>

                    </div>
                </div>

                <div className=" flex flex-col md:flex-row justify-center items-center gap-5">
                    <div className="payment h-100 w-full md:w-xl bg-white/10 rounded-4xl p-5 md:p-10 flex flex-col items-center gap-4">
                        <div className="font-bold text-xl">Support | @{user1.username}</div>
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
                                    onClick={handlePay}
                                    disabled={isPaying}
                                    className={`cursor-pointer rounded-2xl w-full text-white font-medium text-sm px-5 py-2.5 text-center me-2 mb-2 h-12 ${isPaying
                                        ? 'bg-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300'
                                        }`}
                                >
                                    {isPaying ? 'Processing...' : `Pay ₹${formData.amount || 0}`}
                                </button>
                            </div>
                        </div>
                        <div>
                            {[50, 100, 150].map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                                    className="cursor-pointer relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
                                >
                                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                                        ₹{amount}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <FadeInSection>
                        <div className="supporters flex flex-col min-h-100 w-full md:min-w-xl overflow-auto bg-white/10 rounded-4xl pt-5 pb-10 pr-5 pl-5 md:pr-10 md:pl-10 text-gray-300">
                            <div className="mx-auto pb-2 font-bold text-2xl flex justify-center items-center">
                                <div>
                                    <Lottie
                                        className="w-13 h-13 text-white p-2 rounded-full"
                                        animationData={animationData2}
                                        loop
                                        lottieRef={lottieRef2}
                                    />
                                </div>
                                <div>Supporters</div>
                            </div>
                            <ul className="py-3 flex flex-col gap-1">
                                {toshow.map((item) => (
                                    <li key={uuidv4()} className="flex items-center gap-2">
                                        {animationData && (
                                            <Lottie
                                                className="w-10 h-10 text-white p-2 rounded-full"
                                                animationData={animationData}
                                                loop
                                                lottieRef={lottieRef}
                                            />
                                        )}
                                        <div>
                                            {item.name} sent ₹{item.amount} with message : {item.message}
                                        </div>
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