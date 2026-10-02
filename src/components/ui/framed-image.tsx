import Image from "next/image";
import { asset } from "@/lib/asset-path";
import { cn } from "@/lib/utils";
import { OBJECT_POSITION } from "@/lib/image-position";

type FramedImageProps = {
  src: string;
  alt: string;
  caption?: string;
  aspectClassName?: string;
  sizes?: string;
  className?: string;
  position?: keyof typeof OBJECT_POSITION;
};

export function FramedImage({
  src,
  alt,
  caption,
  aspectClassName = "aspect-video",
  sizes = "(min-width: 1024px) 800px, 100vw",
  className,
  position = "center",
}: FramedImageProps) {
  return (
    <div
      className={cn(
        "as-neon-card relative w-full overflow-hidden rounded-2xl border border-glass-border shadow-card transition-shadow duration-300 hover:shadow-card-hover",
        aspectClassName,
        className
      )}
    >
      {/* Static fill image. The live site does not parallax its photography —
          images sit still inside their frame and only the section reveals. */}
      <Image src={asset(src)} alt={alt} fill sizes={sizes} className={cn("object-cover", OBJECT_POSITION[position])} />
      {caption ? (
        <div className="absolute bottom-0 left-0 p-5">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">{caption}</span>
        </div>
      ) : null}
    </div>
  );
}
