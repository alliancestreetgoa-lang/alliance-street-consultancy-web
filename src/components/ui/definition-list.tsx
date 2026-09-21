import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type DefinitionItem = {
  title: string;
  description: string;
  /** When set, the whole entry becomes a link. */
  href?: string;
};

type DefinitionListProps = {
  /** Optional Space Mono group heading, rendered in red. */
  heading?: string;
  items: DefinitionItem[];
  className?: string;
};

/**
 * The site's standard title-and-description list.
 *
 * Taken from the Services dropdown, which reads more cleanly than the bordered
 * cards these sections used to carry: at four or six entries a grid of cards
 * turns every item into a box to parse, while a plain list lets the titles
 * form a single scannable column. Nothing here draws a border, a background or
 * a shadow — the eyebrow and the type hierarchy carry the structure.
 */
export function DefinitionList({ heading, items, className }: DefinitionListProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {heading ? <span className="as-eyebrow as-eyebrow-accent">{heading}</span> : null}
      <ul className="flex flex-col gap-6">
        {items.map((item) => (
          <li key={item.title}>
            {item.href ? (
              <Link
                href={item.href}
                className="group -mx-3 flex items-start justify-between gap-3 rounded-xl px-3 py-2 transition-colors duration-350 hover:bg-foreground/5"
              >
                <span className="flex flex-col gap-1">
                  <span className="block text-lg font-semibold text-foreground">{item.title}</span>
                  <span className="block text-sm text-muted-foreground">{item.description}</span>
                </span>
                <ArrowUpRight
                  className="mt-1 size-4 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
              </Link>
            ) : (
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
