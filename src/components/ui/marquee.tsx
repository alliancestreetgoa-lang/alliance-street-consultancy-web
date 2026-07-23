import { cn } from "@/lib/utils";

type MarqueeProps = {
  items: string[];
  className?: string;
};

function MarqueeSet({ items }: { items: string[] }) {
  return (
    <div className="flex items-center space-x-12 px-6">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="flex items-center gap-12">
          <span>{item}</span>
          <span className={index % 2 === 0 ? "text-primary/60" : "text-secondary-foreground/30"}>✦</span>
        </span>
      ))}
    </div>
  );
}

export function Marquee({ items, className }: MarqueeProps) {
  return (
    <div
      className={cn(
        "overflow-hidden border-y border-border/50 bg-background/60 py-4 backdrop-blur-md",
        className
      )}
    >
      <div className="flex w-max animate-marquee-scroll text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground md:text-sm">
        <MarqueeSet items={items} />
        <MarqueeSet items={items} />
      </div>
    </div>
  );
}
