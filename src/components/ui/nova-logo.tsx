import React, { useId } from "react";

export function NovaLogo({ size = 32 }: { size?: number }) {
  const uid = useId();
  const gradId = `nova-fur-${uid}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="#0c0a1a" />
      {/* Ears */}
      <circle cx="10" cy="8" r="4.5" fill={`url(#${gradId})`} />
      <circle cx="22" cy="8" r="4.5" fill={`url(#${gradId})`} />
      {/* Head */}
      <ellipse cx="16" cy="16" rx="9.5" ry="9" fill={`url(#${gradId})`} />
      {/* Eyes */}
      <ellipse cx="13" cy="14.5" rx="1.8" ry="2" fill="#0c0a1a" />
      <ellipse cx="19" cy="14.5" rx="1.8" ry="2" fill="#0c0a1a" />
      <circle cx="13.5" cy="14" r="0.7" fill="#fff" />
      <circle cx="19.5" cy="14" r="0.7" fill="#fff" />
      {/* Nose */}
      <ellipse cx="16" cy="17.5" rx="1.3" ry="1" fill="#1a0a2e" />
      {/* Mouth */}
      <path d="M15 18.5 Q16 19.5 17 18.5" stroke="#1a0a2e" strokeWidth="0.5" fill="none" />
      {/* Shield on forehead */}
      <path
        d="M15 11 L16 10 L17 11 L17 12.5 L16 13.5 L15 12.5 Z"
        fill="#fff"
        opacity="0.85"
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
