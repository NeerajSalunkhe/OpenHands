'use client'
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import FadeInSection2 from '../components/FadeInSection2';
import toast from 'react-hot-toast';

const Page = () => {
    const { data: session } = useSession();
    const [user, setUser] = useState({
        name: '',
        username: '',
        profilephoto: '',
        razorpayid: '',
        razorpaysecret: '',
    });

    useEffect(() => {
        if (!session?.user?.email) return;
        async function fetchUser() {
            const res = await fetch(`/api/user/${session.user.email}`);
            if (!res.ok) {
                console.error('Failed to fetch user');
                return;
            }
            const data = await res.json();
            setUser({
                name: data.name || '',
                username: data.username || '',
                profilephoto: data.profilephoto || '',
                razorpayid: data.razorpayid || '',
                razorpaysecret: data.razorpaysecret || '',
            });
        }
        fetchUser();
    }, [session]);

    const handleChange = (e) => {
        setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch(`/api/user/${session.user.email}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        });
        toast.success('Saved Successfully');
    };

    return (
        <motion.div
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: -40 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
            <div className="details flex flex-col text-gray-200 gap-10 m-0 inset-0 -z-10 min-h-screen h-full w-full items-center px-4 md:px-5 pt-24 md:pt-10 pb-10 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]">
                <form
                    className="mt-10 md:mt-20 flex flex-col gap-1 justify-center w-full max-w-md items-center"
                    onSubmit={handleSubmit}
                >
                    <FadeInSection2>
                        <div className="font-bold text-3xl my-2 text-center">Fill Details</div>
                    </FadeInSection2>

                    <div className="w-full">
                        <FadeInSection2><div>Name</div></FadeInSection2>
                        <input
                            onChange={handleChange}
                            value={user.name}
                            type="text"
                            name="name"
                            className="my-2 w-full h-12 rounded-2xl bg-blue-950 px-3"
                        />
                    </div>

                    <div className="w-full">
                        <FadeInSection2><div>Username</div></FadeInSection2>
                        <input
                            onChange={handleChange}
                            value={user.username}
                            type="text"
                            name="username"
                            className="my-2 w-full h-12 rounded-2xl bg-blue-950 px-3"
                        />
                    </div>

                    <div className="w-full">
                        <FadeInSection2><div>Profile Picture</div></FadeInSection2>
                        <input
                            onChange={handleChange}
                            value={user.profilephoto}
                            type="text"
                            name="profilephoto"
                            className="cursor-pointer my-2 w-full h-12 rounded-2xl bg-blue-950 px-3"
                        />
                    </div>

                    <div className="w-full">
                        <FadeInSection2><div>RazorPay Id</div></FadeInSection2>
                        <input
                            onChange={handleChange}
                            value={user.razorpayid}
                            type="text"
                            name="razorpayid"
                            className="my-2 w-full h-12 rounded-2xl bg-blue-950 px-3"
                        />
                    </div>

                    <div className="w-full">
                        <FadeInSection2><div>RazorPay Secret</div></FadeInSection2>
                        <input
                            onChange={handleChange}
                            value={user.razorpaysecret}
                            type="text"
                            name="razorpaysecret"
                            className="my-2 w-full h-12 rounded-2xl bg-blue-950 px-3"
                        />
                    </div>

                    <div className="pt-1 w-full my-7">
                        <button
                            onClick={handleSubmit}
                            type="submit"
                            className="cursor-pointer rounded-2xl w-full text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium text-sm px-5 py-2.5 text-center me-2 mb-2 h-12"
                        >
                            SAVE
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default Page;
