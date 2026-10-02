import { SITE_URL } from "../github";

const CARDS = [
  { to: "/cms/", external: true, title: "Edit website content", body: "Pages, sections, services, menus, forms, images and brand settings. Saving creates a draft — nothing goes live until it is published." },
  { to: "/publishing", title: "Website publishing", body: "See what is live, preview drafts, approve and publish them, and roll back a change." },
  { to: "/leads", title: "Leads", body: "Consultation and appointment enquiries. Search, filter, record follow-up and export." },
  { to: "/account", title: "Account", body: "Change the admin password used for the portal and the content editor." },
  { to: "/help", title: "Help", body: "How editing, previews, publishing, rollback and leads work, step by step." },
];

export function Overview({ go }: { go: (to: string) => void }) {
  return (
    <div className="stack">
      <div>
        <h1>Staff portal</h1>
        <p className="lede">Manage the Alliance Street website and its enquiries. <a href={SITE_URL} target="_blank" rel="noreferrer">Open the website ↗</a></p>
      </div>
      <div className="grid">
        {CARDS.map((c) => (
          <a key={c.to} href={c.to} className="card stack" style={{ textDecoration: "none", color: "inherit" }}
            onClick={(e) => { if (!c.external) { e.preventDefault(); go(c.to); } }}>
            <h2 style={{ margin: 0 }}>{c.title}{c.external ? " ↗" : ""}</h2>
            <p className="muted" style={{ margin: 0 }}>{c.body}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
