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
    >
      <defs>
        <filter
          id="blurMain"
          filterUnits="userSpaceOnUse"
          x="-500" y="-500" width="2200" height="1800"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="90" in="SourceGraphic" />
        </filter>

        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.01" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" mode="overlay" />
        </filter>

        <radialGradient id="glow1" cx="80%" cy="20%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={bgColor} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glow2" cx="90%" cy="50%" r="55%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={bgColor} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glow3" cx="10%" cy="75%" r="65%">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={bgColor} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glow4" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={bgColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="800" fill={bgColor} />

      <g filter="url(#blurMain)">
        <ellipse cx="900" cy="200" rx="350" ry="280" fill="url(#glow1)" opacity="1" />
        <ellipse cx="950" cy="400" rx="330" ry="300" fill="url(#glow2)" opacity="0.95" />
        <ellipse cx="400" cy="550" rx="360" ry="320" fill="url(#glow3)" opacity="0.98" />
        <ellipse cx="600" cy="400" rx="450" ry="380" fill="url(#glow4)" opacity="0.85" />
      </g>

      <rect width="1200" height="800" filter="url(#grain)" opacity="0.1" pointerEvents="none" />
    </svg>
  );
}