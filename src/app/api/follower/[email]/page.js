'use client'
import React, { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from "next-auth/react";
const FollowButton = ({ }) => {
    const params = useParams();
    const targetEmail = Array.isArray(params?.email) ? params.email[0] : params?.email
    const [targetUser, setTargetUser] = useState({
        followers: [],
    })
    const { data: session, status } = useSession();
    useEffect(() => {
        if (!targetEmail) return

        const fetchTargetUser = async () => {
            try {
                const res = await fetch(`/api/user/${encodeURIComponent(targetEmail)}`)
                const data = await res.json()
                if (data.email) {
                    setTargetUser({
                        followers: data.followers || [],
                    })
                }
            } catch (err) {
                toast.error('Error fetching target user')
            }
        }

        fetchTargetUser()
    }, [targetEmail])

    return (
        <>
            <Toaster />
            <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] flex flex-col justify-baseline text-white">
                <div className='mt-20 '>
                    <Link href={targetEmail == session?.user?.email.replace(/@/,'%40') ? '/dashboard' : `/api/person/${targetEmail}`}
                        type="button" className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">GO BACK</Link>
                    <div className='font-semibold mb-3 min-w-150 text-2xl text-center'>Followers</div>
                    <div className='space-y-2'>
                        {targetUser.followers.length > 0 ? (
                            targetUser.followers.map((follower, index) => (
                                <div
                                    key={index}
                                    className='bg-gray-800 p-4 rounded-3xl text-sm hover:bg-gray-700 transition duration-200'
                                >
                                    {follower}
                                </div>
                            ))
                        ) : (
                            <p className='text-gray-400'>No followers yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default FollowButton
