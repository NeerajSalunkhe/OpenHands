'use client'
import React, { useEffect, useState, useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast';

const FollowButton = ({ targetEmail, viewerEmail }) => {
  const [targetUser, setTargetUser] = useState({
    followers: [],
    following: [],
    followerCount: 0,
  });

  const [me, setMe] = useState({
    followers: [],
    following: [],
    isFollowingTarget: false,
  });

  const isFirstUpdate = useRef(true);

  useEffect(() => {
    if (!targetEmail) return;

    const fetchTargetUser = async () => {
      try {
        // SINGLE encode for the URL path
        const res = await fetch(`/api/user/${encodeURIComponent(targetEmail)}`);
        const data = await res.json();

        if (data.email) {
          setTargetUser({
            // DOUBLE‐decode each stored follower so '%2540' → '%40' → '@'
            followers: Array.isArray(data.followers)
              ? data.followers.map(f => decodeURIComponent(decodeURIComponent(f)))
              : [],
            following: Array.isArray(data.following)
              ? data.following.map(f => decodeURIComponent(decodeURIComponent(f)))
              : [],
            followerCount: Array.isArray(data.followers) ? data.followers.length : 0,
          });
        }
      } catch (err) {
        console.error('Error fetching target user:', err);
      }
    };

    fetchTargetUser();
  }, [targetEmail]);

  useEffect(() => {
    if (!viewerEmail) return;

    const fetchMe = async () => {
      try {
        // SINGLE encode for the URL path
        const res = await fetch(`/api/user/${encodeURIComponent(viewerEmail)}`);
        const data = await res.json();

        if (data.email) {
          const decodedFollowers = Array.isArray(data.followers)
            ? data.followers.map(f => decodeURIComponent(decodeURIComponent(f)))
            : [];
          const decodedFollowing = Array.isArray(data.following)
            ? data.following.map(f => decodeURIComponent(decodeURIComponent(f)))
            : [];

          setMe({
            followers: decodedFollowers,
            following: decodedFollowing,
            // Compare plain emails
            isFollowingTarget: targetEmail ? decodedFollowing.includes(targetEmail) : false,
          });
        }
      } catch (err) {
        console.error('Error fetching viewer user:', err);
      }
    };

    fetchMe();
  }, [viewerEmail, targetEmail]);

  useEffect(() => {
    if (isFirstUpdate.current) {
      isFirstUpdate.current = false;
      return;
    }

    const updateServer = async () => {
      try {
        // SINGLE‐encode for the URL path; double‐encode only in the JSON body arrays
        await fetch(`/api/user/${encodeURIComponent(targetEmail)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            followers: targetUser.followers.map(f =>
              encodeURIComponent(encodeURIComponent(f))
            ),
            following: targetUser.following.map(f =>
              encodeURIComponent(encodeURIComponent(f))
            ),
          }),
        });

        await fetch(`/api/user/${encodeURIComponent(viewerEmail)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            followers: me.followers.map(f =>
              encodeURIComponent(encodeURIComponent(f))
            ),
            following: me.following.map(f =>
              encodeURIComponent(encodeURIComponent(f))
            ),
          }),
        });
      } catch (err) {
        console.error('Error updating users on server:', err);
      }
    };

    updateServer();
  }, [
    me,
    targetUser.followers,
    targetUser.following,
    targetEmail,
    viewerEmail,
  ]);

  const handleClick = () => {
    const alreadyFollowing = me.following.includes(targetEmail);

    if (!alreadyFollowing) {
      // Add viewerEmail to targetUser.followers (plain, decoded)
      setTargetUser(prev => ({
        ...prev,
        followers: [...prev.followers, viewerEmail],
        followerCount: prev.followerCount + 1,
      }));
      // Add targetEmail to me.following (plain, decoded)
      setMe(prev => ({
        ...prev,
        following: [...prev.following, targetEmail],
        isFollowingTarget: true,
      }));
      toast.success(`Following ${targetEmail}`);
    } else {
      // Remove viewerEmail from targetUser.followers
      setTargetUser(prev => ({
        ...prev,
        followers: prev.followers.filter(email => email !== viewerEmail),
        followerCount: prev.followerCount - 1,
      }));
      // Remove targetEmail from me.following
      setMe(prev => ({
        ...prev,
        following: prev.following.filter(email => email !== targetEmail),
        isFollowingTarget: false,
      }));
      toast.success(`Not Following ${targetEmail}`);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div>
        <button
          onClick={handleClick}
          type="button"
          className="m-2 ml-3 text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 w-28"
        >
          {me.isFollowingTarget ? 'Unfollow' : 'Follow'}
        </button>
      </div>
    </>
  );
};

export default FollowButton;
