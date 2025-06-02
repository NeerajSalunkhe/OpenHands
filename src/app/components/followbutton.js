'use client'
import React, { useEffect, useState, useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast';

const FollowButton = ({ targetEmail, viewerEmail }) => {
    const [targetUser, setTargetUser] = useState({
        followers: [],
        following: [],
        followerCount: 0,
    })

    const [me, setMe] = useState({
        followers: [],
        following: [],
        isFollowingTarget: false,
    })

    const isFirstUpdate = useRef(true)

    useEffect(() => {
        if (!targetEmail) return

        const fetchTargetUser = async () => {
            try {
                // Ensure targetEmail is encoded for the API call
                const res = await fetch(`/api/user/${encodeURIComponent(targetEmail)}`)
                const data = await res.json()
                if (data.email) {
                    setTargetUser({
                        // Decode follower emails if they were stored encoded in the database
                        followers: data.followers ? data.followers.map(f => decodeURIComponent(f)) : [],
                        following: data.following ? data.following.map(f => decodeURIComponent(f)) : [],
                        followerCount: Array.isArray(data.followers) ? data.followers.length : 0,
                    })
                }
            } catch (err) {
                console.error('Error fetching target user:', err)
            }
        }

        fetchTargetUser()
    }, [targetEmail])

    useEffect(() => {
        if (!viewerEmail) return

        const fetchMe = async () => {
            try {
                // Ensure viewerEmail is encoded for the API call
                const res = await fetch(`/api/user/${encodeURIComponent(viewerEmail)}`)
                const data = await res.json()
                if (data.email) {
                    // Decode following emails if they were stored encoded in the database
                    const myFollowing = data.following ? data.following.map(f => decodeURIComponent(f)) : [];
                    setMe({
                        followers: data.followers ? data.followers.map(f => decodeURIComponent(f)) : [],
                        following: myFollowing,
                        // Compare decoded emails for consistency
                        isFollowingTarget: targetEmail ? myFollowing.includes(targetEmail) : false,
                    })
                }
            } catch (err) {
                console.error('Error fetching viewer user:', err)
            }
        }

        fetchMe()
    }, [viewerEmail, targetEmail])

    useEffect(() => {
        if (isFirstUpdate.current) {
            isFirstUpdate.current = false
            return
        }

        const updateServer = async () => {
            try {
                // Ensure emails are encoded when sending to the server
                await fetch(`/api/user/${encodeURIComponent(targetEmail)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        // Encode followers before sending to the database
                        followers: targetUser.followers.map(f => encodeURIComponent(f)),
                        following: targetUser.following.map(f => encodeURIComponent(f)),
                    }),
                })

                await fetch(`/api/user/${encodeURIComponent(viewerEmail)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        followers: me.followers.map(f => encodeURIComponent(f)),
                        following: me.following.map(f => encodeURIComponent(f)),
                    }),
                })
            } catch (err) {
                console.error('Error updating users on server:', err)
            }
        }

        updateServer()
    }, [me, targetUser.followers, targetUser.following, targetEmail, viewerEmail]) // Added targetUser.following to dependency array

    const handleClick = () => {
        const alreadyFollowing = me.following.includes(targetEmail)

        if (!alreadyFollowing) {
            setTargetUser((prev) => ({
                ...prev,
                followers: [...prev.followers, viewerEmail],
                followerCount: prev.followerCount + 1,
            }))
            setMe((prev) => ({
                ...prev,
                following: [...prev.following, targetEmail],
                isFollowingTarget: true,
            }))
            toast.success(`Following ${targetEmail}`);
        }
        else {
            setTargetUser((prev) => ({
                ...prev,
                followers: prev.followers.filter((email) => email !== viewerEmail),
                followerCount: prev.followerCount - 1,
            }))
            setMe((prev) => ({
                ...prev,
                following: prev.following.filter((email) => email !== targetEmail),
                isFollowingTarget: false,
            }))
            toast.success(`Not Following ${targetEmail}`);
        }
    }

    return (
        <>
            <Toaster position="top-center" />
            <div>
                <button onClick={handleClick} type="button" className="m-2 ml-3 text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 w-28">{me.isFollowingTarget ? 'Unfollow' : 'Follow'}</button>
            </div>
        </>
    )
}

export default FollowButton