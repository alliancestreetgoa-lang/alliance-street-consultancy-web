import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * A CMS link: site paths use next/link (basePath and prefetch), https opens in a
 * new tab with the usual protections, mailto/tel/#anchors are plain anchors.
 */
export function SmartLink({ href, children, ...rest }: Omit<ComponentProps<"a">, "href"> & { href: string }) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return <Link href={href} {...rest}>{children}</Link>;
  }
  if (href.startsWith("https://")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return <a href={href} {...rest}>{children}</a>;
}
