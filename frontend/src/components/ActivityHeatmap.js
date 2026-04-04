import React from 'react';
import { motion } from 'framer-motion';

const ActivityHeatmap = ({ data }) => {
  // data: [{ _id: '2026-03-25', count: 5 }]
  const today = new Date();
  const days = [];
  
  // Create last 90 days
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayData = data.find(item => item._id === dateStr);
    days.push({
      date: dateStr,
      count: dayData ? dayData.count : 0
    });
  }

  const getColor = (count) => {
    if (count === 0) return 'bg-teal-50';
    if (count < 3) return 'bg-teal-200';
    if (count < 6) return 'bg-teal-400';
    return 'bg-teal-600';
  };

  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {days.map((day, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.005 }}
          className={`w-3 h-3 rounded-sm ${getColor(day.count)} cursor-help relative group`}
          title={`${day.date}: ${day.count} submissions`}
        >
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#114a42] text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none font-bold uppercase tracking-widest">
            {day.date}: {day.count}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ActivityHeatmap;
