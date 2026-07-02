// src/components/RojDisc.jsx
import { useMemo } from 'react';

/**
 * The roj (sun-disc) is the page's one signature element: it anchors the
 * hero, and doubles as the loading indicator so the "system is working"
 * feedback is the same motif as the brand mark rather than a generic
 * spinner. Ray count shifts subtly between dialects (12 for Kurmancî, 16
 * for Soranî) as a quiet nod to the toggle actually having happened.
 */
export default function RojDisc({
  size = 96,
  rayCount = 12,
  spinning = false,
  className = '',
}) {
  const rays = useMemo(
    () =>
      Array.from({ length: rayCount }, (_, i) => (360 / rayCount) * i),
    [rayCount]
  );

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`${className} ${
        spinning ? 'motion-safe:animate-ray-spin-slow' : ''
      }`}
      role="img"
      aria-label="Roj — sun disc"
    >
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        {rays.map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="50"
            x2="50"
            y2="8"
            transform={`rotate(${deg} 50 50)`}
            opacity="0.85"
          />
        ))}
      </g>
      <circle cx="50" cy="50" r="19" fill="currentColor" />
      <circle
        cx="50"
        cy="50"
        r="19"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
    </svg>
  );
}
