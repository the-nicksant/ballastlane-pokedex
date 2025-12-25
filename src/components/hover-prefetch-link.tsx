"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComponentProps, useCallback } from "react";

interface HoverPrefetchLinkProps extends ComponentProps<typeof Link> {
  prefetch?: boolean;
}

export function HoverPrefetchLink({
  prefetch = true,
  ...props
}: HoverPrefetchLinkProps) {
  const router = useRouter();

  const handleMouseEnter = useCallback(() => {
    if (prefetch && typeof props.href === "string") {
      router.prefetch(props.href);
    }
  }, [prefetch, props.href, router]);

  return <Link {...props} prefetch={false} onMouseEnter={handleMouseEnter} />;
}
