export default function Logo({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="100"
      height="100"
      fill="none"
      {...props}
    >
      <rect width="100" height="100" fill="oklch(0.67 0.16 58)" rx="20" />
      <g fill="#fff">
        <circle cx="50" cy="50" r="28" />
        <path d="M50 30c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm0 35c-8.28 0-15-6.72-15-15s6.72-15 15-15 15 6.72 15 15-6.72 15-15 15z" />
      </g>
      <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
        <path d="M40 70c5-5 15-5 20 0" />
        <path d="M45 65c3-3 7-3 10 0" />
      </g>
    </svg>
  );
}
