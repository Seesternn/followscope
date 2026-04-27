# followscope

| Site | [followscope](https://seesternn.github.io/followscope/) |
| ---- | ------------------------------------------------------- |

> A privacy-first Instagram follow analyzer. Upload your data export, instantly see who isn't following you back — with follow dates, live search, and bilingual support. No server. No tracking. No nonsense.

![status](https://img.shields.io/badge/status-live-brightgreen?style=flat-square)
![built with](https://img.shields.io/badge/built%20with-HTML%20%2F%20CSS%20%2F%20JS-blueviolet?style=flat-square)
![no backend](https://img.shields.io/badge/backend-none-lightgrey?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

---

## Preview

```
┌─────────────────────────────────────────────────────────────────┐
│  Following: 412   Followers: 308   Not Back: 104   Fans: 0      │
├──────────────────────────────┬──────────────────────────────────┤
│  NOT FOLLOWING BACK    104   │  UNRETURNED FANS           0     │
│  ─────────────────────────   │  ───────────────────────────     │
│  🔍 Search...                │  🔍 Search...                    │
│                              │                                  │
│  @username_a                 │  (empty — great!)                │
│  Following since: Jan 2023   │                                  │
│  @username_b                 │                                  │
│  Following since: Mar 2024   │                                  │
└──────────────────────────────┴──────────────────────────────────┘
```

---

## Screenshots

![followscope upload screen](https://raw.githubusercontent.com/Seesternn/followscope/main/site1.png)

![followscope results screen](https://raw.githubusercontent.com/Seesternn/followscope/main/site2.png)

---

## Features

- **Not following back** — accounts you follow that don't follow you
- **Unreturned fans** — accounts that follow you but you haven't followed back
- **Follow date** — exact date each follow relationship started, parsed from your export
- **Summary stats** — total following, total followers, and both gap counts at a glance
- **Live search** — filter through large lists in real time, one panel at a time
- **Click to visit** — every username links directly to their Instagram profile
- **TR / EN language toggle** — switch languages instantly, dates reformat automatically
- **Drag & drop upload** — drop your JSON files directly onto the upload zones
- **Zero dependencies** — no npm, no build step, no framework

---

## File Structure

```
followscope/
├── index.html      # Page structure and markup
├── style.css       # All visual styling — layout, colors, animations, dark theme
├── app.js          # All logic — JSON parsing, rendering, filtering, i18n, drag & drop
└── README.md
```

### What each file does

| File | Purpose |
|------|---------|
| `index.html` | Defines the page skeleton: header, upload zones, stats cards, result panels. Contains no logic or styles — just structure. |
| `style.css` | Handles everything visual: dark theme with CSS variables, responsive grid layout, drop zone states, user list rows, animations, and the language toggle. Uses [Google Fonts](https://fonts.google.com) (Syne + DM Sans) loaded via `@import` — the only external resource. |
| `app.js` | Contains all the JavaScript: reads uploaded files via the browser's `FileReader` API, parses both Instagram JSON formats (following uses `title`, followers uses `string_list_data[].value`), computes the two difference sets, renders the user lists with timestamps, handles live search filtering, manages TR/EN translations, and sets up drag & drop events. No libraries. No external calls. |

### Where to get these files

Download the latest release directly from this repository:

```
https://github.com/Seesternn/followscope
```

Click **Code → Download ZIP**, extract it, and open `index.html` in any modern browser.

---

## How to get your Instagram data

Instagram lets you export your own data for free. The files are usually ready within a few minutes to a few hours.

### Requesting the export

Follow this exact path inside the Instagram app or website:

```
Settings > Accounts Center > Your information and permissions > Download your information
```

Select the information you want to include and submit the request.
When the files are ready, return to the same page and tap **Download** to save the ZIP file.

---

### Finding the right files

Unzip the downloaded file and navigate to:

```
connections/
  followers_and_following/
    following.json       <- upload this as "Following"
    followers_1.json     <- upload this as "Followers"
```

Drag and drop (or select) these two files into followscope — that's all it needs.

---

## Privacy & Data

| Question | Answer |
|----------|--------|
| Are my files uploaded to a server? | **No.** Files are read entirely by your browser using the `FileReader` API. They never leave your device. |
| Does the site make any network requests? | Only one: loading the Google Fonts stylesheet (`fonts.googleapis.com`) for typography. Your Instagram data is never involved. |
| Is anything stored — cookies, localStorage? | **Nothing.** No storage of any kind is used. Closing the tab wipes everything. |
| Can I use it offline? | Yes, if you download the files and run locally. The only thing that won't load offline is the font. |
| Does it track usage or analytics? | **No.** There is no analytics script, no pixel, no tracking of any kind. |

---

## Running Locally

No installation or build step required.

```bash
git clone https://github.com/Seesternn/followscope.git
cd followscope
# open index.html in your browser
```

Or just download the ZIP from GitHub and open `index.html` directly.

---

## Browser Support

Works in all modern browsers: Chrome, Firefox, Safari, Edge. Requires JavaScript enabled.

---

## License

MIT — free to use, modify, and distribute.
