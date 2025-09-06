'use client';

import React from 'react';
import styles from './SimpleChart.module.css';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface SimpleChartProps {
  title: string;
  data: ChartData[];
  height?: number;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ title, data, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div 
        className={`${styles.chartContainer} space-y-3`}
        ref={(el) => {
          if (el) {
            el.style.setProperty('--chart-height', `${height}px`);
          }
        }}
      >
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm text-gray-600">{item.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${styles.bar} h-2 rounded-full transition-all duration-500 ${item.color}`}
                  ref={(el) => {
                    if (el) {
                      el.style.setProperty('--bar-width', `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleChart;
