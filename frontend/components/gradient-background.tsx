export default function GradientBackground({
  color,
  bgColor,
  className = '',
}: { color: string; bgColor: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 800"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute inset-0 w-full h-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ isolation: 'isolate' }} // Prevents blending issues with parent elements
    >
      <defs>
        <filter
          id="blur1"
          x="-50%" y="-50%" width="200%" height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="80" />
        </filter>
        <filter
          id="blur2"
          x="-50%" y="-50%" width="200%" height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="90" />
        </filter>
        <filter
          id="blur3"
          x="-50%" y="-50%" width="200%" height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="100" />
        </filter>

        <radialGradient id="glow1" cx="80%" cy="20%" r="60%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: bgColor, stopOpacity: 0 }} />
        </radialGradient>

        <radialGradient id="glow2" cx="90%" cy="50%" r="55%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: bgColor, stopOpacity: 0 }} />
        </radialGradient>

        <radialGradient id="glow3" cx="10%" cy="75%" r="65%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.95 }} />
          <stop offset="100%" style={{ stopColor: bgColor, stopOpacity: 0 }} />
        </radialGradient>

        <radialGradient id="glow4" cx="50%" cy="50%" r="70%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: bgColor, stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      <rect width="1200" height="800" fill={bgColor} />

      <g opacity="1" filter="url(#blur1)">
        <ellipse cx="900" cy="200" rx="350" ry="280" fill="url(#glow1)" />
      </g>

      <g opacity="0.95" filter="url(#blur2)">
        <ellipse cx="950" cy="400" rx="330" ry="300" fill="url(#glow2)" />
      </g>

      <g opacity="0.98" filter="url(#blur3)">
        <ellipse cx="400" cy="550" rx="360" ry="320" fill="url(#glow3)" />
      </g>

      <g opacity="0.85" filter="url(#blur1)">
        <ellipse cx="600" cy="400" rx="450" ry="380" fill="url(#glow4)" />
      </g>
    </svg>
  );
}