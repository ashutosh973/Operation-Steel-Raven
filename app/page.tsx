import Link from "next/link";
import type { CSSProperties } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const systems = [
  {
    number: "01",
    title: "First-person combat",
    copy: "A dedicated weapon rig, aim-down-sights, recoil, reloads, fire modes and grounded movement built for mouse, keyboard and controller.",
  },
  {
    number: "02",
    title: "Reactive patrols",
    copy: "Soldiers investigate sound, share alerts, search last-known positions and return to their routes when Raven disappears into the forest.",
  },
  {
    number: "03",
    title: "A living battlefield",
    copy: "Rain, wind, river valleys, steep approaches and dense Black Pines reshape visibility, sound and every route into the checkpoint.",
  },
  {
    number: "04",
    title: "Restraint matters",
    copy: "Disable the military relay while protecting the civil fire-warning transmitter. Mission conduct changes the final assessment.",
  },
];

const controls = [
  ["Move", "W A S D"],
  ["Aim / fire", "RMB / LMB"],
  ["Sprint", "Shift"],
  ["Crouch / prone", "C / P"],
  ["Interact", "E"],
  ["Reload", "R"],
  ["Perspective", "V"],
  ["Pause / controls", "Esc / F11"],
];

const missions = [
  ["01", "Border Crossing", "Playable web vertical slice"],
  ["02", "Lantern Causeway", "Campaign build"],
  ["03", "Iron Span", "Campaign build"],
  ["04—10", "The Korona Corridor", "Campaign build"],
];

export default function Home() {
  return (
    <main id="main-content">
      <a className="skip-link" href="#brief">Skip to mission briefing</a>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Operation Steel Raven home">
          <span className="wordmark-mark" aria-hidden="true">SR</span>
          <span>
            <strong>Operation</strong>
            <b>Steel Raven</b>
          </span>
        </Link>
        <nav aria-label="Primary navigation">
          <a href="#brief">Briefing</a>
          <a href="#systems">Field systems</a>
          <a href="#controls">Controls</a>
        </nav>
        <Link className="header-play" href="/play">
          Play Mission 1 <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div
          className="terrain-backdrop"
          aria-hidden="true"
          style={{ "--hero-image": `url(${basePath}/media/black-pines-valley.jpg)` } as CSSProperties}
        >
          <div className="terrain-ridge terrain-ridge-far" />
          <div className="terrain-ridge terrain-ridge-near" />
          <div className="terrain-grid" />
        </div>
        <div className="hero-copy">
          <div className="eyebrow-row">
            <span className="status-dot" />
            Web vertical slice
            <span className="eyebrow-separator">{"//"}</span>
            Mission 01
          </div>
          <p className="kicker">Behind the Enemy Lines</p>
          <h1 id="hero-title">Enter the<br /><em>Black Pines.</em></h1>
          <p className="hero-lede">
            One operative. A rain-dark mountain corridor. Break the military tracking
            network without silencing the system that protects civilians below.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" href="/play">
              Deploy now <span aria-hidden="true">→</span>
            </Link>
            <a className="secondary-action" href="#brief">Review the operation</a>
          </div>
          <p className="platform-note">Desktop browser · Mouse &amp; keyboard · Controller ready</p>
        </div>

        <aside className="mission-card" aria-label="Mission one overview">
          <div className="mission-card-topline">
            <span>OP-01 / BORDER CROSSING</span>
            <span className="live-label">ACTIVE</span>
          </div>
          <div className="route-map" aria-hidden="true">
            <span className="contour contour-a" />
            <span className="contour contour-b" />
            <span className="contour contour-c" />
            <span className="route-line route-one" />
            <span className="route-line route-two" />
            <span className="map-point insertion"><i /> INSERTION</span>
            <span className="map-point checkpoint"><i /> CHECKPOINT</span>
            <span className="map-point relay"><i /> RADAR RELAY</span>
            <span className="map-point extraction"><i /> EXTRACTION</span>
          </div>
          <div className="mission-readout">
            <div><span>Environment</span><strong>Wet mountain forest</strong></div>
            <div><span>Patrol strength</span><strong>Six soldiers</strong></div>
            <div><span>Approach</span><strong>Stealth or direct</strong></div>
          </div>
        </aside>

        <div className="hero-metrics" aria-label="Mission statistics">
          <div><strong>01</strong><span>operator</span></div>
          <div><strong>06</strong><span>armed patrol</span></div>
          <div><strong>01</strong><span>relay target</span></div>
          <div><strong>∞</strong><span>ways through</span></div>
        </div>
      </section>

      <section className="brief-section" id="brief">
        <div className="section-index">01 / THE OPERATION</div>
        <div className="brief-heading">
          <p className="section-kicker">Mission briefing</p>
          <h2>Military control ends here.<br />Civil lifelines stay online.</h2>
        </div>
        <div className="brief-copy">
          <p>
            Captain Alex “Raven” enters the fictional Korona Corridor through the Black
            Pines. A fortified checkpoint controls the forest road while a converted
            wildfire station tracks movement across the valley.
          </p>
          <p>
            Reach the compound, contain its patrol, isolate the military tracking relay
            and leave the protected fire-warning transmitter intact. Then reach the
            extraction point before the corridor closes.
          </p>
        </div>
        <div className="objective-board">
          <div className="objective-primary">
            <span>Primary objective</span>
            <h3>Disable the military radar relay</h3>
            <p>Reach checkpoint · Neutralize patrol · Isolate relay · Extract</p>
          </div>
          <div className="objective-rules">
            <span>Rules of engagement</span>
            <ul>
              <li><b>Preserve</b> the civil fire-warning band</li>
              <li><b>Protect</b> civilians and anyone who surrenders</li>
              <li><b>Recover</b> evidence before extraction</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="systems-section" id="systems">
        <div className="systems-heading">
          <div>
            <p className="section-kicker">Built for immersion</p>
            <h2>Every system serves<br />the mission.</h2>
          </div>
          <p>
            A focused browser edition of Mission 1, carrying the same tactical systems
            as the desktop campaign while loading only what the Black Pines needs.
          </p>
        </div>
        <div className="systems-grid">
          {systems.map((system) => (
            <article key={system.number}>
              <span>{system.number}</span>
              <h3>{system.title}</h3>
              <p>{system.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="controls-section" id="controls">
        <div className="controls-copy">
          <p className="section-kicker">Field manual</p>
          <h2>Move deliberately.<br />React instantly.</h2>
          <p>
            Click inside the game to capture the pointer. Press Escape whenever you need
            the cursor, pause menu or a clean exit back to the operation page.
          </p>
          <Link className="text-link" href="/play">Open deployment screen <span>→</span></Link>
        </div>
        <div className="control-list" aria-label="Keyboard controls">
          {controls.map(([action, key]) => (
            <div key={action}>
              <span>{action}</span>
              <kbd>{key}</kbd>
            </div>
          ))}
        </div>
      </section>

      <section className="campaign-section">
        <div className="campaign-heading">
          <div>
            <p className="section-kicker">The campaign</p>
            <h2>One corridor.<br />Ten operations.</h2>
          </div>
          <p>Mission 1 is the browser vertical slice. The complete campaign remains available in the desktop build while each operation is optimized for the web.</p>
        </div>
        <div className="mission-list">
          {missions.map(([number, title, status], index) => (
            <div className={index === 0 ? "mission-row mission-row-active" : "mission-row"} key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
              <small>{status}</small>
              <i aria-hidden="true">{index === 0 ? "READY" : "LOCKED"}</i>
            </div>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <span className="section-index">BLACK PINES / DEPLOYMENT WINDOW OPEN</span>
        <h2>The corridor is waiting.</h2>
        <p>Headphones recommended. Best experienced fullscreen on a desktop browser.</p>
        <Link className="primary-action primary-action-large" href="/play">
          Play Mission 1 <span aria-hidden="true">→</span>
        </Link>
      </section>

      <footer>
        <div className="wordmark footer-wordmark">
          <span className="wordmark-mark" aria-hidden="true">SR</span>
          <span><strong>Operation</strong><b>Steel Raven</b></span>
        </div>
        <p>
          A fictional story set in the invented Korona Corridor. Its factions, geography,
          personnel and events are not real. The game does not portray current operations
          or provide real-world tactical guidance.
        </p>
        <div className="footer-links">
          <Link href="/privacy">Privacy</Link>
          <a href="#hero-title">Return to top ↑</a>
        </div>
      </footer>
    </main>
  );
}
