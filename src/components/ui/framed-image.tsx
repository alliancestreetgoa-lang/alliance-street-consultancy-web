import { ParallaxImage } from "@/components/ui/parallax-image";
import { cn } from "@/lib/utils";

type FramedImageProps = {
  src: string;
  alt: string;
  caption?: string;
  aspectClassName?: string;
  sizes?: string;
  className?: string;
};

export function FramedImage({
  src,
  alt,
  caption,
  aspectClassName = "aspect-video",
  sizes = "(min-width: 1024px) 800px, 100vw",
  className,
}: FramedImageProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-glass-border shadow-card transition-shadow duration-300 hover:shadow-card-hover",
        aspectClassName,
        className
      )}
    >
      <ParallaxImage src={src} alt={alt} sizes={sizes} />
      {caption ? (
        <div className="absolute bottom-0 left-0 p-5">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">{caption}</span>
        </div>
      ) : null}
    </div>
  );
}
