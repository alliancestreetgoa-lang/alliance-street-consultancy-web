# Managing the Alliance Street website

For the people who keep the website and enquiries up to date. No technical
knowledge is needed.

**Staff portal:** <https://alliance-street-leads.web.app>
(the old `…/admin/` link on the website forwards there)

## 1. Signing in

| To… | Sign in with | Ask the administrator for |
| --- | --- | --- |
| Edit or publish the website | **GitHub** (a free account) | An invitation to the website. Accept it from the email GitHub sends. |
| See enquiries (leads) | **Google** | Your Google email on the staff list |

Sign out with the button at the top of each screen. Closing the browser tab
ends your GitHub session in the portal.

**Your role decides what you can do.** It is enforced by GitHub and the
database, not just hidden in the screens:

- **Editor** can change anything on the site and send it for review, but can't publish.
- **Publisher** approves and publishes other people's changes. Your own changes need a second publisher or the administrator.
- **Administrator** can publish anything and manages who has access.

## 2. Editing a page

1. Portal → **Edit website content** → **Pages** → open the page.
2. The page is a list of **sections** (hero, text and image, cards, FAQ…).
   - **Reorder:** drag a section by its handle.
   - **Duplicate or remove:** use the section's menu (⋮).
   - **Hide:** tick *Hide this section*. The content is kept but the section
     doesn't appear on the site. Hiding is safer than removing.
   - **Add:** *Add section*, then choose a type.
3. Type in the fields. Text fields marked as formatted support **bold**,
   *italic*, links and bullet lists.
4. **Save.** This creates a **draft**. The live website does not change.

You can type `{{company.email}}`, `{{company.phone}}`, `{{company.address}}`
or `{{company.name}}` in legal text and cards, and the current company details
are filled in.

### Everything else you can edit

| Where | What |
| --- | --- |
| **Pages** | Every page, its sections, its address, whether it is published, its search title/description/sharing image |
| **Services** | The service catalogue (each service has its own page), the photo on each service page, and the headings used on service pages |
| **Tax figures & sources** | Rates, thresholds and deadlines. Every figure needs an official source and the date it was checked. Changes need the administrator's approval. |
| **Settings → Company, menus & footer** | Contact details, social links, header, main menu, services menu, footer links and wording, search defaults |
| **Settings → Forms** | Every label, hint, button and message on the consultation, contact and newsletter forms, plus the appointment calendar link |
| **Settings → Testimonials** | Client quotes. Only tick *Client approved publication* when the client has agreed. |
| **Settings → Brand & appearance** | Accent colour, typeface, text size, spacing between sections, animation and the opening logo animation. These are vetted presets, so every choice stays readable. |

## 3. Creating a page

1. **Pages → New page.**
2. Give it a **page name** and a **web address** such as `/uae-guide`
   (lowercase words and hyphens).
3. Add sections. Start with a *Hero — page* section; a page has exactly one.
4. Fill in **Search & sharing**: a plain, honest title and description.
5. Save. To let visitors find the page, add it to a menu in
   **Settings → Company, menus & footer**.

**Safeguards.** The core pages (Home, About, Services, Industries, Case
Studies, Pricing, Contact, the two booking pages, Privacy Policy and Terms)
can be edited but not deleted or moved. Don't change the address of a page
that has been live: links and search rankings break. Hide a page before
deleting it. A change with a broken link, a link to a hidden page, a missing
image or a missing required field **cannot be published**. The check tells
you what to fix.

## 4. Images and video

- Use **Upload** in any image field, or the **Assets** library to browse,
  replace and delete files.
- Always fill in **alt text**: one sentence saying what the image shows.
- Pick a **focus point** (centre, top, bottom, left, right) so cropping on a
  phone keeps the important part.
- Images are converted and resized automatically, up to 2,400 px. Videos (the
  home hero) must be MP4 or WebM, short, silent and under 40 MB.

## 5. Previewing

A few minutes after you save, **View Preview** appears on the draft in the
editor and on **Website publishing** in the portal. The preview is the whole
website built with your change: exactly what would go live. It shows a black
"Preview of an unpublished change" bar at the bottom.

If the preview or the **publish check** fails, open it. The message names the
page and field to fix. Fix it, save, and the preview rebuilds.

## 6. Publishing

1. When you are happy with the preview, set the draft's status to **Ready**
   (editor → *Workflow*, or the status menu on the entry).
2. A **publisher** opens Portal → **Website publishing**, opens the preview,
   presses **Approve**, then **Publish…** and confirms.
3. The status shows **Building**, then **Live**, usually 2–4 minutes. If a
   build fails, the website keeps showing the previous version, and the portal
   says so with a link to the log.

## 7. Undoing a change (rollback)

Portal → **Website publishing** → **Recently published** → **Roll back…** on
the change. This creates a new draft that undoes it. Preview it, then publish
it like any other change. Every version of every page is kept permanently, so
nothing is ever lost.

## 8. Leads (enquiries)

Portal → **Leads**.

- A lead is saved **as soon as the visitor presses Continue**, even if they
  never choose an enquiry or the calendar.
- **Enquiry requested:** they asked you to follow up.
- **Calendar opened:** they opened the Zoom booking page. This is **not** a
  confirmed meeting. Tick **Meeting confirmed** only after you have seen the
  booking in Zoom.
- **Search** by name, email, phone or notes. **Filter** by status, next step,
  service and date.
- Open a lead to record its **status** and **internal notes**. Every change is
  kept in the lead's **history** with your name and the time.
- **Export** (publishers and administrators) downloads the leads currently
  shown as a spreadsheet. The file contains personal data. Store it securely
  and delete it when you are done.
- **Delete** (administrators only) is for data-erasure requests and can't be undone.

Visitors' own answers can't be edited by staff; your work is stored beside them.

## 9. Things that need a developer

- A new *kind* of section or a new layout.
- New enquiry service categories or new questions on the booking form.
- Changing the address of a live page or service safely (redirects).
- Adding advisor credentials (ACCA numbers etc.).
- Connecting Telegus CRM, a newsletter list, or the contact page's message form.

**Good to know:** the newsletter sign-up and the contact page's message form
do **not** store or send anything yet. The contact form tells the visitor to
email you instead. Until they are connected, consider hiding the newsletter
section (Home page) and turning off *Show the message form* (Contact page).
