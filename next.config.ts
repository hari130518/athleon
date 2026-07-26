import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the router cache from holding dynamic dashboard pages for too
  // long between navigations. `static` has a minimum of 30s.
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
