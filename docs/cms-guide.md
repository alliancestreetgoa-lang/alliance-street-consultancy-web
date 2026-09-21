# Editing the website

A guide for whoever maintains the site's content. No technical knowledge
needed.

## Getting in

Go to **`<your-site>/admin/`** and sign in with GitHub. You'll need a GitHub
account that has been given access to the site — ask whoever set the site up.

## How changes go live

Nothing changes on the live site the moment you hit Save. Instead:

1. You save a change.
2. The site rebuilds automatically.
3. About **two minutes later**, the change is live.

If you don't see your change, wait a couple of minutes and refresh.

This delay buys you something worth having: every change is recorded, with your
name and the date, and any change can be undone. Nothing is ever silently
overwritten.

## What you can edit

| Section | What's in it |
| --- | --- |
| **Services** | The 23 services — titles, summaries, what's included, who each is for |
| **Tax figures & sources** | Rates, thresholds and deadlines shown on service pages |
| **Site & navigation** | Company phone, email, address, and both menus |
| **Page content** | Headlines, home page sections, case studies, industries, pricing factors |
| **Imagery** | The photograph on each service section |

## Tax figures work differently

Everything on this site publishes when you save it. **Tax figures are the one
exception.**

When you change a rate, threshold or deadline, saving does not publish it.
It creates a change request that someone else has to approve. You'll see it
move through *Draft → In Review → Ready*, and a second person merges it.

This is deliberate. Wrong marketing copy is embarrassing and fixable in two
minutes. A wrong tax rate on an accountancy firm's website is different in
kind — a reader can act on it and be penalised for it. So that one change
gets a second pair of eyes.

## The one rule that really matters

**Every tax figure needs a source and a date.**

If you change a rate, a threshold or a deadline, you must also:

- name the **official source** you got it from — the Federal Tax Authority, the
  UAE Ministry of Finance, or GOV.UK — with a link, and
- update **"Figures last checked"** to today's date.

If you save a figure without a source, **the site will not update**. The change
is saved, but the rebuild stops and the live site keeps showing the old
version until it's fixed. This is deliberate: a wrong tax figure on an
accountancy firm's website is a serious problem, and the site is built to
refuse to publish one that nobody can trace.

You'll know this happened because the change won't appear after a few minutes.

## Things to be careful with

**Web addresses.** Each service has a "Web address" field. Changing it changes
that page's URL — which breaks any existing link to it, and loses its position
in Google. Ask a developer before changing one.

**Alt text on images.** When you upload an image, describe what's in it. That
text is read aloud to visually impaired visitors and is used by search engines.

**Deleting things.** Removing a service also removes it from the menus. If
something links to it, the site will tell you on the next rebuild rather than
shipping a broken link.

## Adding an image

Upload it in the image field. It's resized and optimised automatically — you
don't need to prepare it first. Large photographs straight from a camera are
fine.

## If something goes wrong

Nothing you do here is permanent or unrecoverable. Every change is stored with
a full history, and any of it can be rolled back by a developer.

If the site stops updating, it's almost always a tax figure saved without a
source. Check the most recent thing you edited.
