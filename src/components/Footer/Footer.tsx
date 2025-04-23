'use client';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-6 mt-20 text-center text-sm text-gray-600 dark:text-gray-300 border-t">
      <div className="mb-2">
        © {new Date().getFullYear()} DENTARA – All rights reserved.
      </div>
      <div className="flex justify-center gap-4 text-blue-600 dark:text-blue-400 mt-2">
        <a href="https://t.me/dentara" target="_blank" rel="noopener noreferrer">Telegram</a>
        <a href="https://twitter.com/dentara_io" target="_blank" rel="noopener noreferrer">Twitter</a>
        <a href="https://discord.gg/dentara" target="_blank" rel="noopener noreferrer">Discord</a>
        <a href="mailto:feedback@dentara.io">Email</a>
      </div>
      <div className="mt-3">
        <a href="/privacy-policy" className="hover:underline">Privacy Policy</a> |{" "}
        <a href="/terms-of-service" className="hover:underline ml-2">Terms of Service</a>
      </div>
    </footer>
  );
}
