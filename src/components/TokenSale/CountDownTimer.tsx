"use client";
import { useEffect, useState } from "react";

const targetDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

export default function CountDownTimer() {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const calculateRemainingPercentage = () => {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();
    const elapsedPercentage = (difference / targetDate.getTime()) * 100;
    const remainingPercentage = (100 - elapsedPercentage).toFixed(2);

    return `${remainingPercentage}%`;
  };

  const formatNumber = (num: number): number[] => {
    const formattedNumber = num.toString().padStart(2, "0");
    return formattedNumber.split("").map(Number);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      setDays(d);

      const h = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      setHours(h);

      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      setMinutes(m);

      const s = Math.floor((difference % (1000 * 60)) / 1000);
      setSeconds(s);
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <div className="flex items-start justify-center">
      <div className="text-center">
        <span className="mb-2 block text-2xl font-bold text-white sm:text-3xl md:text-[45px]">
          {formatNumber(days).map((digit, index) => (
            <span key={index}>{digit}</span>
          ))}
        </span>
        <span className="text-xs font-medium text-white uppercase sm:text-sm md:text-lg">
          DAYS
        </span>
      </div>

      <span className="px-2 text-2xl font-bold text-white sm:px-4 sm:text-3xl md:text-[45px]">
        :
      </span>

      <div className="text-center">
        <span className="mb-2 block text-2xl font-bold text-white sm:text-3xl md:text-[45px]">
          {formatNumber(hours).map((digit, index) => (
            <span key={index}>{digit}</span>
          ))}
        </span>
        <span className="text-xs font-medium text-white uppercase sm:text-sm md:text-lg">
          Hours
        </span>
      </div>

      <span className="px-2 text-2xl font-bold text-white sm:px-4 sm:text-3xl md:text-[45px]">
        :
      </span>

      <div className="text-center">
        <span className="mb-2 block text-2xl font-bold text-white sm:text-3xl md:text-[45px]">
          {formatNumber(minutes).map((digit, index) => (
            <span key={index}>{digit}</span>
          ))}
        </span>
        <span className="text-xs font-medium text-white uppercase sm:text-sm md:text-lg">
          Minutes
        </span>
      </div>

      <span className="px-2 text-2xl font-bold text-white sm:px-4 sm:text-3xl md:text-[45px]">
        :
      </span>

      <div className="text-center">
        <span className="mb-2 block text-2xl font-bold text-white sm:text-3xl md:text-[45px]">
          {formatNumber(seconds).map((digit, index) => (
            <span key={index}>{digit}</span>
          ))}
        </span>
        <span className="text-xs font-medium text-white uppercase sm:text-sm md:text-lg">
          Seconds
        </span>
      </div>
    </div>
  );
}
