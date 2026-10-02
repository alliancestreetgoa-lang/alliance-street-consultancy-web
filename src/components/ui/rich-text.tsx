import Link from "next/link";
import type { ReactNode } from "react";
import { fill } from "@/lib/content/fill";
import { cn } from "@/lib/utils";

/**
 * A deliberately small Markdown subset for CMS text: paragraphs (blank line),
 * bullet lists ("- "), **bold**, *italic* and [links](/page). It builds React
 * elements and never injects HTML, so nothing an editor types can add markup or
 * scripts to the page.
 */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${i++}`;
    if (match[1] !== undefined) {
      const href = match[2];
      if (href.startsWith("/") && !href.startsWith("//")) {
        out.push(<Link key={key} href={href} className="underline underline-offset-4 hover:text-primary">{match[1]}</Link>);
      } else if (/^(https:\/\/|mailto:|tel:)/.test(href)) {
        const external = href.startsWith("https://");
        out.push(
          <a key={key} href={href} className="underline underline-offset-4 hover:text-primary"
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {match[1]}{external ? <span className="sr-only"> (opens in a new tab)</span> : null}
          </a>
        );
      } else {
        out.push(match[1]);
      }
    } else if (match[3] !== undefined) {
      out.push(<strong key={key} className="font-semibold text-foreground">{match[3]}</strong>);
    } else {
      out.push(<em key={key}>{match[4]}</em>);
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function RichText({ text, className, paragraphClassName }: { text: string; className?: string; paragraphClassName?: string }) {
  const blocks = fill(text).replace(/\r\n/g, "\n").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {blocks.map((block, index) => {
        const lines = block.split("\n");
        if (lines.every((line) => /^[-*]\s+/.test(line))) {
          return (
            <ul key={index} className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground marker:text-primary">
              {lines.map((line, j) => <li key={j}>{inline(line.replace(/^[-*]\s+/, ""), `${index}-${j}`)}</li>)}
            </ul>
          );
        }
        return <p key={index} className={paragraphClassName}>{inline(lines.join(" "), String(index))}</p>;
      })}
    </div>
  );
}
