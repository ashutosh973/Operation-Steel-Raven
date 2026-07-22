import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy details for the Operation Steel Raven browser demo.",
};

export default function PrivacyPage() {
  return (
    <main className="play-page" id="main-content">
      <header className="play-header">
        <Link className="wordmark" href="/" aria-label="Return to Operation Steel Raven">
          <span className="wordmark-mark" aria-hidden="true">SR</span>
          <span><strong>Operation</strong><b>Steel Raven</b></span>
        </Link>
        <Link className="back-link" href="/">← Return to operations</Link>
      </header>
      <section className="privacy-panel">
        <p className="section-kicker">Player privacy</p>
        <h1>Anonymous, minimal measurement.</h1>
        <p>
          When analytics is enabled, the site records aggregate page visits and five
          mission stages: launch clicked, Unity loaded, mission started, mission
          completed and mission failed.
        </p>
        <p>
          It does not send names, email addresses, account identifiers, saved
          checkpoints, scores, weapon choices, gameplay inputs or free-text data.
          Query strings are removed except standard campaign attribution fields.
        </p>
        <p>
          Collection uses Plausible Analytics without cookies or persistent player
          identifiers. Global Privacy Control and browser Do Not Track signals are
          respected. Analytics failure never blocks the game.
        </p>
        <a className="text-link" href="https://plausible.io/data-policy">
          Read Plausible&apos;s data policy <span aria-hidden="true">↗</span>
        </a>
      </section>
    </main>
  );
}
