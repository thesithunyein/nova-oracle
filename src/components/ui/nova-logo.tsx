import React from "react";

export function NovaLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="nova-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="nova-inner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#nova-g)" />
      <path
        d="M11 12 L16 7.5 L21 12 L21 20.5 L16 25 L11 20.5 Z"
        fill="rgba(255,255,255,0.15)"
      />
      <path
        d="M13.5 13.5 L16 10.5 L18.5 13.5 L18.5 19 L16 22 L13.5 19 Z"
        fill="white"
        opacity="0.95"
      />
      <path
        d="M15 15 L16 13.5 L17 15 L17 18 L16 19.5 L15 18 Z"
        fill="url(#nova-inner)"
        opacity="0.8"
      />
    </svg>
  );
}

export function NovaLogoFull({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <NovaLogo size={size} />
      <span
        className="font-bold tracking-tight"
        style={{ fontSize: size * 0.7 }}
      >
        <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
          Nova
        </span>
        <span className="text-white">Pay</span>
      </span>
    </div>
  );
}
