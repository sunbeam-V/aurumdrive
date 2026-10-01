import createNextIntlPlugin from 'next-intl/plugin';
import type {NextConfig} from 'next';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
const scriptSources = process.env.NODE_ENV === 'production'
  ? "'self' 'unsafe-inline' https://www.googletagmanager.com https://mc.yandex.ru"
  : "'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://mc.yandex.ru";

const securityHeaders = [
  {key: 'X-Content-Type-Options', value: 'nosniff'},
  {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
  {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()'},
  {key: 'X-DNS-Prefetch-Control', value: 'on'},
  {key: 'Content-Security-Policy', value: `default-src 'self'; script-src ${scriptSources}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://mc.yandex.ru; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com https://mc.yandex.ru; object-src 'none'; base-uri 'self'; form-action 'self'`}
];

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {unoptimized: true},
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: ['**.manuspre.computer', '**.manus.computer'],
  experimental: {optimizePackageImports: ['lucide-react', 'framer-motion']},
  serverExternalPackages: ['mysql2'],
  async headers() {
    return [{source: '/(.*)', headers: securityHeaders}];
  }
};

export default withNextIntl(nextConfig);