/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Meal photos are written to /public/uploads at runtime and served statically.
  // Using plain <img> + unoptimized keeps the app dependency-free and portable.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
