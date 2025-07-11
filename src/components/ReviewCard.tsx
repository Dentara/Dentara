import React from 'react';

type ReviewProps = {
  reviewer: string;
  rating: number; // 1–5
  text: string;
};

export default function ReviewCard({ reviewer, rating, text }: ReviewProps) {
  const stars = Array(5)
    .fill(0)
    .map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));

  return (
    <div className="border p-4 rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-center mb-2">
        <strong className="text-gray-800">{reviewer}</strong>
        <div className="text-sm">{stars}</div>
      </div>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
}
