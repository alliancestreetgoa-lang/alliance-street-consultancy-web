const STEPS: { title: string; items: string[] }[] = [
  { title: "Signing in", items: [
    "Website content and publishing: “Sign in with GitHub” using the GitHub account the administrator invited.",
    "Leads: “Sign in with Google” using the email address on the staff list.",
    "Sign out from the top of each screen. Leaving the browser tab ends the GitHub session in this portal.",
  ] },
  { title: "Editing a page", items: [
    "Open Edit website content → Pages → choose the page.",
    "Each page is a list of sections. Drag to reorder; use a section’s menu to duplicate or remove it; tick “Hide this section” to keep it but take it off the page.",
    "Add a section with “Add section” and pick a type (text and image, cards, FAQ, call to action…).",
    "Press Save. This creates a draft. The live website does not change.",
  ] },
  { title: "Creating a page", items: [
    "Pages → New page. Give it a name and a web address such as /uae-guide, add sections, save.",
    "Add it to a menu in Settings → Company, menus & footer if visitors should find it.",
    "Core pages (Home, About, Services, …) cannot be deleted or moved; hide sections instead.",
  ] },
  { title: "Images and media", items: [
    "Use the image field’s Upload button, or the Assets library to replace a file.",
    "Always write the description (alt text). Choose a focus point so cropping keeps the important part.",
    "Images are resized and optimised automatically. Videos must be under 40 MB.",
  ] },
  { title: "Previewing", items: [
    "A few minutes after saving, the draft shows “View Preview” in the editor and on Website publishing.",
    "The preview is the whole site built with your change — exactly what will go live.",
    "If the preview or publish check fails, open it: the message names the page and field to fix.",
  ] },
  { title: "Publishing", items: [
    "In the editor, set the draft’s status to “Ready”.",
    "A publisher opens Website publishing, checks the preview, approves and publishes. Publishers’ own changes need a second publisher or the administrator.",
    "The status changes to Building, then Live (usually 2–4 minutes). If a build fails, the site keeps the previous version.",
  ] },
  { title: "Rolling back", items: [
    "Website publishing → Recently published → Roll back. This creates a draft that undoes the change.",
    "Preview it and publish it like any other change.",
  ] },
  { title: "Leads", items: [
    "A lead is saved as soon as the visitor presses Continue, even if they never choose an enquiry or the calendar.",
    "“Calendar opened” means they opened the booking page. Tick “Meeting confirmed” only after you see the booking.",
    "Record status and notes; every change is kept in the lead’s history. Exported files contain personal data — store them securely and delete them when finished.",
  ] },
];

export function Help() {
  return (
    <div className="stack">
      <div>
        <h1>Help</h1>
        <p className="lede">The full guide is in the repository at <code>docs/client-guide.md</code>. What needs a developer is listed at the end of it.</p>
      </div>
      <div className="grid">
        {STEPS.map((s) => (
          <section key={s.title} className="card">
            <h2>{s.title}</h2>
            <ol className="small" style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
              {s.items.map((i) => <li key={i}>{i}</li>)}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
