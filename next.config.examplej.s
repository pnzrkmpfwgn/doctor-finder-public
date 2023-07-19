
module.exports = {
  reactStrictMode: true,
  experimental: { appDir: true },
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true },
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })
    return config
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env:{
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY  :"Your Keys",
        API_KEY :"Your Keys",
        AUTH_DOMAIN :"Your Keys",
        PROJECT_ID :"Your Keys",
        STORAGE_BUCKET :"Your Keys",
        MESSAGING_SENDER_ID :"Your Keys",
        APP_ID :"Your Keys",
        DATABASE_URL :"Your Keys",
        ALGOLIA_PROJECT_ID:"Your Keys",
        ALGOLIA_API_KEY:"Your Keys",
  }
  
}
