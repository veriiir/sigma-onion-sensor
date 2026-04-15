import React from 'react';

interface SensorGaugeProps {
  value: number;
  min: number;
  max: number;
  goodMin: number;
  goodMax: number;
  size?: number;
}

export default function SensorGauge({ value, min, max, goodMin, goodMax, size = 100 }: SensorGaugeProps) {
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const isGood = value >= goodMin && value <= goodMax;

  const cx = size / 2;
  const cy = size * 0.6;
  const r = size * 0.38;
  const strokeWidth = size * 0.08;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;

  function polarToCartesian(angle: number) {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function describeArc(startAngle: number, endAngle: number) {
    const start = polarToCartesian(endAngle);
    const end = polarToCartesian(startAngle);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  const fillAngle = startAngle + percentage * totalAngle;
  const trackPath = describeArc(startAngle, endAngle);
  const fillPath = percentage > 0 ? describeArc(startAngle, fillAngle) : '';

  const needleAngle = startAngle + percentage * totalAngle;
  const needleLength = r * 0.75;
  const needleRad = (needleAngle * Math.PI) / 180;
  const nx = cx + needleLength * Math.cos(needleRad);
  const ny = cy + needleLength * Math.sin(needleRad);

  const fillColor = isGood ? '#38b2ac' : value < goodMin ? '#f59e0b' : '#ef4444';
  const trackColor = '#e2e8f0';

  return (
    <svg width={size} height={size * 0.72} viewBox={`0 0 ${size} ${size * 0.72}`}>
      <path d={trackPath} fill="none" stroke={trackColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      {percentage > 0 && (
        <path
          d={fillPath}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ transition: 'all 1s ease' }}
        />
      )}
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke={fillColor}
        strokeWidth={size * 0.025}
        strokeLinecap="round"
        style={{ transition: 'all 1s ease' }}
      />
      <circle cx={cx} cy={cy} r={size * 0.04} fill={fillColor} style={{ transition: 'fill 1s ease' }} />
      <circle cx={cx} cy={cy} r={size * 0.025} fill="white" />

      <path
        d={describeArc(startAngle + totalAngle * (goodMin - min) / (max - min), startAngle + totalAngle * (goodMax - min) / (max - min))}
        fill="none"
        stroke="#38b2ac"
        strokeWidth={strokeWidth * 0.3}
        strokeLinecap="round"
        opacity="0.25"
      />
    </svg>
  );
}
