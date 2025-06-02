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
        const res = await fetch(`/api/user/${encodeURIComponent(targetEmail)}`)
        const data = await res.json()
        if (data.email) {
          setTargetUser({
            followers: data.followers || [],
            following: data.following || [],
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
        const res = await fetch(`/api/user/${encodeURIComponent(viewerEmail)}`)
        const data = await res.json()
        if (data.email) {
          const myFollowing = data.following || []
          setMe({
            followers: data.followers || [],
            following: myFollowing,
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
        await fetch(`/api/user/${encodeURIComponent(targetEmail)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            followers: targetUser.followers,
            following: targetUser.following,
          }),
        })

        await fetch(`/api/user/${encodeURIComponent(viewerEmail)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            followers: me.followers,
            following: me.following,
          }),
        })
      } catch (err) {
        console.error('Error updating users on server:', err)
      }
    }

    updateServer()
  }, [me, targetUser.followers, targetEmail, viewerEmail])

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
        {/* <Toaster position="top-center" /> */}
      <div>
        <button onClick={handleClick} type="button" className="m-2 ml-3 text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 w-28">{me.isFollowingTarget ? 'Unfollow' : 'Follow'}</button>
      </div>
    </>

  )
}

export default FollowButton
