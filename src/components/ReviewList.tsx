'use client';

import React from 'react';
import ReviewCard from './ReviewCard';

type Review = {
  reviewer: string;
  rating: number;
  text: string;
};

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews || reviews.length === 0) {
    return <p className="text-gray-500">No reviews yet.</p>;
  }

  return (
    <div className="grid gap-4">
      {reviews.map((review, i) => (
        <ReviewCard key={i} {...review} />
      ))}
    </div>
  );
}
