import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // The old Wix blog URLs, so existing links keep working once this site
  // serves thenovu.in.
  async redirects() {
    return [
      { source: '/blog', destination: '/journal', permanent: true },
      { source: '/blog/categories/:category', destination: '/journal', permanent: true },
      { source: '/post/:slug', destination: '/journal/:slug', permanent: true },
    ];
  },
};

export default nextConfig;
