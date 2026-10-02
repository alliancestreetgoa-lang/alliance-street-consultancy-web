import { useEffect, useState } from "react";
import { Overview } from "./pages/Overview";
import { Publishing } from "./pages/Publishing";
import { Leads } from "./pages/Leads";
import { Team } from "./pages/Team";
import { Help } from "./pages/Help";
import { USING_EMULATOR } from "./firebase";

const ROUTES = [
  { path: "/", label: "Overview" },
  { path: "/publishing", label: "Website publishing" },
  { path: "/leads", label: "Leads" },
  { path: "/team", label: "Team & access" },
  { path: "/help", label: "Help" },
] as const;

function usePath() {
  const [path, setPath] = useState(location.pathname);
  useEffect(() => {
    const onPop = () => setPath(location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const go = (to: string) => {
    history.pushState(null, "", to + location.search);
    setPath(to);
    window.scrollTo(0, 0);
  };
  return [path, go] as const;
}

export function App() {
  const [path, go] = usePath();
  const route = ROUTES.find((r) => r.path === path) ?? ROUTES[0];
  useEffect(() => { document.title = `${route.label} — Alliance Street staff portal`; }, [route.label]);

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand"><img src="/favicon.png" alt="" /> Alliance Street</div>
        <nav className="nav" aria-label="Staff portal">
          {ROUTES.map((r) => (
            <a key={r.path} href={r.path} aria-current={r.path === route.path ? "page" : undefined}
              onClick={(e) => { e.preventDefault(); go(r.path); }}>{r.label}</a>
          ))}
          <a href="/cms/">Edit website content ↗</a>
        </nav>
        <div className="foot">
          Staff only. Activity is recorded.{USING_EMULATOR ? <><br /><strong>Emulator mode — test data</strong></> : null}
        </div>
      </aside>
      <main className="main" id="main">
        {route.path === "/" && <Overview go={go} />}
        {route.path === "/publishing" && <Publishing />}
        {route.path === "/leads" && <Leads />}
        {route.path === "/team" && <Team />}
        {route.path === "/help" && <Help />}
      </main>
    </div>
  );
}
