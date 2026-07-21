"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  const words = title.split(" ");

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow ? (
        <span className="text-sm font-medium uppercase tracking-widest text-primary">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            initial={{ opacity: 0, y: "0.6em", filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="mr-[0.25em] inline-block"
          >
            {word}
          </motion.span>
        ))}
      </h2>
      {description ? <p className="max-w-2xl text-lg text-muted-foreground">{description}</p> : null}
    </div>
  );
}
