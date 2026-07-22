import type { Metadata } from "next";
import Link from "next/link";
import { GameLauncher } from "./GameLauncher";

export const metadata: Metadata = {
  title: "Play Mission 1",
  description: "Launch Border Crossing, the Operation Steel Raven browser vertical slice.",
};

export default function PlayPage() {
  return (
    <main className="play-page" id="main-content">
      <a className="skip-link" href="#deployment">Skip to deployment</a>
      <header className="play-header">
        <Link className="wordmark" href="/" aria-label="Return to Operation Steel Raven">
          <span className="wordmark-mark" aria-hidden="true">SR</span>
          <span><strong>Operation</strong><b>Steel Raven</b></span>
        </Link>
        <Link className="back-link" href="/">← Return to operations</Link>
      </header>
      <div id="deployment"><GameLauncher /></div>
      <div className="preflight-grid">
        <article>
          <span>01</span>
          <h2>Capture input</h2>
          <p>Click once inside the game window. Press Escape to release the pointer.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Choose your route</h2>
          <p>Follow the forest road, move through high cover or descend toward the river.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Protect the network</h2>
          <p>Military tracking is the target. The civil warning transmitter is not.</p>
        </article>
      </div>
      <p className="play-disclaimer">
        Fictional setting · No real-world operational guidance · Desktop browser edition ·{" "}
        <Link href="/privacy">Privacy</Link>
      </p>
    </main>
  );
}
