"use client";

import Image from "next/image";

export function BrandLogo({
  priority = false,
  className = "",
  sizes = "200px",
}: {
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const mergedClassName = className ? `brand-logo ${className}` : "brand-logo";

  return (
    <span className={mergedClassName}>
      <Image
        src="/assets/icon-barbers-logo.png"
        alt="Icon Barbers"
        fill
        priority={priority}
        sizes={sizes}
        className="brand-logo-image"
      />
    </span>
  );
}
