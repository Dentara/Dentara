'use client';

import Link from 'next/link';
import { FaTelegramPlane, FaTwitter, FaDiscord, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-10 mt-20 text-center text-sm text-gray-600 dark:text-gray-300 border-t">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Logo və Qısa Tanıtım */}
        <div className="space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <img src="/logo.svg" alt="Dentara Logo" className="h-8" />
            <span className="font-bold text-gray-800 dark:text-white text-lg">DENTARA</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Blockchain Meets Dentistry. Verified credentials, secure patient records, staking, and DAO governance.
          </p>
          <div className="flex justify-center md:justify-start gap-4 text-blue-600 dark:text-blue-400 mt-4 text-xl">
            <a href="https://t.me/dentara" target="_blank" rel="noopener noreferrer">
              <FaTelegramPlane />
            </a>
            <a href="https://twitter.com/dentara_io" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://discord.gg/dentara" target="_blank" rel="noopener noreferrer">
              <FaDiscord />
            </a>
            <a href="mailto:feedback@dentara.io">
              <FaEnvelope />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link href="/whitepaper" className="hover:underline">Whitepaper</Link></li>
            <li><Link href="/dao" className="hover:underline">DAO Governance</Link></li>
            <li><Link href="/dentists" className="hover:underline">Find Dentists</Link></li>
            <li><Link href="/patient-records" className="hover:underline">Patient Records</Link></li>
          </ul>
        </div>

        {/* Support Links */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Support</h4>
          <ul className="space-y-2">
            <li><Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link href="/terms-of-service" className="hover:underline">Terms of Service</Link></li>
            <li><a href="mailto:feedback@dentara.io" className="hover:underline">Contact Support</a></li>
          </ul>
        </div>

      </div>

      {/* Copyright */}
      <div className="mt-10 border-t pt-6 text-center text-gray-500 dark:text-gray-400 text-xs">
        © {year} DENTARA – All rights reserved.
      </div>
    </footer>
  );
}
