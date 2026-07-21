import { Container } from "@/components/ui/container";
import { MagneticButton } from "@/components/ui/magnetic-button";

export default function Home() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <span className="text-sm font-medium uppercase tracking-widest text-primary">
        Alliance Street Consultancy
      </span>
      <h1 className="font-display text-4xl font-medium tracking-tight text-foreground sm:text-6xl">
        The homepage build starts in Phase 3.
      </h1>
      <p className="max-w-xl text-muted-foreground">
        Phase 1&apos;s design system is live — check the component and token reference below.
      </p>
      <MagneticButton href="/style-guide">View Style Guide</MagneticButton>
    </Container>
  );
}
