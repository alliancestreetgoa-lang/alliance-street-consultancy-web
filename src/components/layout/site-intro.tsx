import Image from "next/image";
import { asset } from "@/lib/asset-path";

/**
 * Opening sequence on a visitor's first page load: the mark and wordmark rise
 * on the dark-red wall, a red rule draws beneath them, then the wall lifts like
 * a curtain to reveal the page (≈1.3s end to end).
 *
 * Deliberately CSS-only. The overlay animates itself out whether or not any
 * JavaScript runs, so a slow or failed bundle can never leave a visitor stuck
 * behind it, and it never intercepts clicks (`pointer-events: none`).
 *
 * The inline script runs before first paint and marks <html> with
 * `data-intro="skip"` once the intro has played in this tab, so it shows on
 * arrival only — not on every reload or client-side navigation. Reduced-motion
 * visitors never see it (handled in CSS). <html> carries
 * suppressHydrationWarning for this attribute.
 */
const SKIP_SCRIPT = `try{var k="as-intro-seen";if(sessionStorage.getItem(k)){document.documentElement.dataset.intro="skip"}else{sessionStorage.setItem(k,"1")}}catch(e){}`;

export function SiteIntro() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SKIP_SCRIPT }} />
      <div aria-hidden className="as-intro">
        <div className="as-intro-inner">
          <div className="as-intro-brand">
            <Image
              src={asset("/brand/logo-mark.png")}
              alt=""
              width={56}
              height={46}
              priority
              className="as-intro-mark"
              style={{ width: "56px", height: "46px" }}
            />
            <span className="as-intro-word">Alliance Street</span>
          </div>
          <span className="as-intro-rule" />
        </div>
      </div>
    </>
  );
}
