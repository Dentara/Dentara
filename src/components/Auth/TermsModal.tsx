"use client";

export default function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="text-lg font-semibold mb-4">Terms & Conditions</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Here you will find the terms of use and legal responsibilities required to register and use the Dentara platform. A downloadable PDF version will also be available.
        </p>
      </div>
    </div>
  );
}