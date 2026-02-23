/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Leaflet utilise des imports dynamiques côté client
  transpilePackages: ['react-leaflet'],
};

export default nextConfig;
