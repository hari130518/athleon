import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Coach/athlete dashboards are per-week and mutate via server actions
  // (planned/actual/distance). The client router cache's default 5-minute
  // "static" staleTime was letting Prev/Next <Link> navigation reuse an
  // older week's cached page segment instead of fetching the newly-loaded
  // week, even right after a save. Force both buckets to 0 so every
  // navigation always fetches fresh data.
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
