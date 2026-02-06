export default function GradientBackground({
  color,
  bgColor,
  className = '',
}: { color: string; bgColor: string; className?: string }) {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 14, g: 165, b: 233 }; // fallback to cyan
  };

  return (
    <svg
      viewBox="0 0 1200 800"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute inset-0 w-full h-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="blur1">
          <feGaussianBlur in="SourceGraphic" stdDeviation="80" />
        </filter>
        <filter id="blur2">
          <feGaussianBlur in="SourceGraphic" stdDeviation="90" />
        </filter>
        <filter id="blur3">
          <feGaussianBlur in="SourceGraphic" stdDeviation="100" />
        </filter>

        {/* Smooth gradient 1 - top right */}
        <radialGradient id="glow1" cx="80%" cy="20%" r="60%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: bgColor, stopOpacity: 0 }} />
        </radialGradient>

        {/* Smooth gradient 2 - mid right */}
        <radialGradient id="glow2" cx="90%" cy="50%" r="55%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: bgColor, stopOpacity: 0 }} />
        </radialGradient>

        {/* Smooth gradient 3 - bottom left */}
        <radialGradient id="glow3" cx="10%" cy="75%" r="65%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.95 }} />
          <stop offset="100%" style={{ stopColor: bgColor, stopOpacity: 0 }} />
        </radialGradient>

        {/* Smooth gradient 4 - center spreading */}
        <radialGradient id="glow4" cx="50%" cy="50%" r="70%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: bgColor, stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      {/* Dark base background */}
      <rect width="1200" height="800" fill={bgColor} />

      {/* Blurred gradient layers */}
      <ellipse
        cx="900"
        cy="200"
        rx="350"
        ry="280"
        fill="url(#glow1)"
        filter="url(#blur1)"
        opacity="1"
      />
      <ellipse
        cx="950"
        cy="400"
        rx="330"
        ry="300"
        fill="url(#glow2)"
        filter="url(#blur2)"
        opacity="0.95"
      />
      <ellipse
        cx="400"
        cy="550"
        rx="360"
        ry="320"
        fill="url(#glow3)"
        filter="url(#blur3)"
        opacity="0.98"
      />
      <ellipse
        cx="600"
        cy="400"
        rx="450"
        ry="380"
        fill="url(#glow4)"
        filter="url(#blur1)"
        opacity="0.85"
      />
    </svg>
  );
};
