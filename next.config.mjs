/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["fluent-ffmpeg", "@ffmpeg-installer/ffmpeg", "@ffprobe-installer/ffprobe"],
};

export default nextConfig;
