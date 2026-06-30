import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options",  value: "nosniff" },
  { key: "X-Frame-Options",         value: "DENY" },
  { key: "X-XSS-Protection",        value: "1; mode=block" },
  { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.34", "10.255.3.150", "10.255.19.219"],

  // Never expose source maps to the browser
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
    ];
  },

  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
