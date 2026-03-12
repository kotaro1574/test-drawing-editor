import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  htmlLimitedBots: /Googlebot|Mediapartners-Google|AdsBot-Google|Google-PageRenderer|Bingbot|BingPreview|Slackbot|Twitterbot|facebookexternalhit|line-poker|LinkedInBot|Discordbot|WhatsApp|Applebot/,
};

export default nextConfig;
