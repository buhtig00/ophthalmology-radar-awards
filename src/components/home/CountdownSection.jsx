import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

function getTimeLeft(targetDate) {
  const diff = new Date(targetDate) - new Date();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeBlock({ value, label }) {
  return (
    <div className="text-center">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-2">
        <span className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-gray-500 text-xs uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function CountdownSection({ eventDate }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(eventDate));

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(eventDate)), 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  return (
    <section className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center"
      >
        <h3 className="text-[#c9a84c] text-sm font-semibold tracking-widest uppercase mb-6">
          Cuenta Regresiva
        </h3>
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          <TimeBlock value={timeLeft.days} label="Días" />
          <span className="text-white/20 text-2xl font-light mt-[-1.5rem]">:</span>
          <TimeBlock value={timeLeft.hours} label="Horas" />
          <span className="text-white/20 text-2xl font-light mt-[-1.5rem]">:</span>
          <TimeBlock value={timeLeft.minutes} label="Min" />
          <span className="text-white/20 text-2xl font-light mt-[-1.5rem]">:</span>
          <TimeBlock value={timeLeft.seconds} label="Seg" />
        </div>
      </motion.div>
    </section>
  );
}