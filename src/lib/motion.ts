import { spring } from "remotion";

// Sample Remotion's critically damped spring once. GSAP and Motion reuse this
// curve with their existing clocks; no extra player or render loop is needed.
const samples = Array.from({ length: 121 }, (_, frame) =>
  spring({
    frame,
    fps: 60,
    durationInFrames: 120,
    config: { damping: 24, stiffness: 144, mass: 1, overshootClamping: true },
  })
);
const end = samples[samples.length - 1];

export function settle(progress: number): number {
  const position = Math.max(0, Math.min(1, progress)) * 120;
  const index = Math.min(119, Math.floor(position));
  return (samples[index] + (samples[index + 1] - samples[index]) * (position - index)) / end;
}
