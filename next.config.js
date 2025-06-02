/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'www.gstatic.com',
      'cdn.worldvectorlogo.com',
      'github.githubassets.com',
      'upload.wikimedia.org',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'images.unsplash.com',
      'encrypted-tbn0.gstatic.com',
      'cdn.pixabay.com',
    ],
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
