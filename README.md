# QR Label Printer

Print QR code labels with serial-number ranges to any ZPL network printer
(built for the SATO CL4NX Plus). React front end, Node.js/Express back end.

- **Printers are chosen in the browser.** Nothing about a printer is hard-coded
  on the server; the selected printer's address is sent with every print.
- **Everything you save lives in the `database/` folder** (printers, templates,
  your current serial range and label settings), not in the browser.
- **Each label has one QR code and the serial once.** You choose whether the
  serial prints on the **top, bottom, left or right** of the QR code.

## Quick start

```bash
npm run install:all   # installs root, server and client dependencies
npm run dev           # server on :3001, React dev server on http://localhost:5173
```

Open http://localhost:5173, click **Add a printer**, enter its IP address
(port 9100 is pre-filled), and press **Test connection**.

### Production (one process)

```bash
npm run build         # builds the React app into client/dist
npm start             # serves the app + API on http://localhost:3001
```

Change the port with `PORT=8080 npm start`.

### Single Windows .exe

```bash
npm run build:exe     # writes dist/qr-label-printer.exe
```

The exe creates its `database` folder next to itself.

## The database folder

```
database/
├── printers.json     saved printers + which one is in use
├── templates.json    saved templates (serial range + label settings)
└── settings.json     the serial range and label settings you are working on
```

- Plain JSON files: you can open them, copy them, or back them up.
- Settings save automatically a moment after you change them.
- Everyone who opens the app on the same server sees the same printers and
  templates (and the same current settings).
- Writes are atomic. If a file ever becomes unreadable it is renamed to
  `<name>.corrupt-<time>.json` and the app starts that part fresh.
- To store the data elsewhere, set `DATABASE_DIR=/path/to/folder`.
- If you used the earlier version, printers/templates saved in your browser
  are imported into the database automatically the first time you open the app.

## Label layout

Choose **Serial text position** (Top / Bottom / Left / Right of the QR) in
*Label settings*. The QR code and its text start at the **Left margin / Top
margin** (under *Margins*), with **Gap between QR and text** between them.

- Top/Bottom: text lines up with the left edge of the QR.
- Left/Right: the text is centred vertically against the QR. With *Left*, the
  text is right-aligned so it sits next to the QR.
- The preview is drawn from the same layout the server uses to build the ZPL.
- The width of the text is **estimated** (it is used to place the QR when the
  text is on the left, and to warn if something may not fit). If the spacing
  isn't what you want on the real label, adjust *Gap* or the margins.

## Project structure

```
QR-Label-Printer/
├── package.json              scripts that run both apps
├── database/                 saved printers, templates, settings (JSON)
├── server/                   Node.js + Express API
│   └── src/
│       ├── index.js          starts the server
│       ├── app.js            express setup, serves client/dist in production
│       ├── config/           PORT, database folder, socket timeouts
│       ├── routes/           URL → controller
│       ├── controllers/      request handling
│       ├── repositories/     read/write printers, templates, settings
│       ├── services/
│       │   ├── database.service.js  JSON file storage (queued, atomic writes)
│       │   ├── layout.service.js    where the QR and text go
│       │   ├── zpl.service.js       builds the ZPL for a label
│       │   ├── qr.service.js        QR size/matrix
│       │   └── printer.service.js   TCP connection to the printer
│       ├── middleware/       error handling
│       └── utils/            input validation, HttpError
└── client/                   React + Vite + Tailwind CSS
    └── src/
        ├── api/              fetch wrapper, print API, database API
        ├── components/       layout, printers, serial, label, print, ui
        ├── context/          PrinterContext (printers + live status)
        ├── hooks/            usePrinters, useTemplates, useSettings, useLabelPreview,
        │                     usePrinterStatus, usePrintJob
        ├── pages/            PrintPage
        ├── utils/            serial range, label helpers, one-time migration
        └── constants/        defaults
```

Libraries: Tailwind CSS v4, `react-icons`, `react-hot-toast`, `qrcode` (server).

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET / POST | `/api/printers` | List / add a printer |
| PUT / DELETE | `/api/printers/:id` | Edit / remove a printer |
| PUT | `/api/printers/selected` | Choose the printer in use `{ id }` |
| POST | `/api/printers/status` | Test a connection `{ printer: {host, port} }` |
| GET / POST | `/api/templates` | List / save a template (same name overwrites) |
| PATCH | `/api/templates/:id/printed` | Record the last printed range |
| DELETE | `/api/templates/:id` | Delete a template |
| GET / PUT | `/api/settings` | Current serial range + label settings |
| POST | `/api/print/label` | Print one serial `{ printer, serial, label? }` |
| POST | `/api/print/preview` | ZPL + layout for one serial `{ serial, label? }` |

`label` accepts: `labelWidth`, `labelHeight`, `qrSize`, `marginLeft`,
`marginTop`, `fontSize`, `textGap`, `textPosition` (`top|bottom|left|right`),
`copies`. The server validates every value.

## Printer setup

The printer must accept raw ZPL on TCP port 9100 (or the port you enter).
On the CL4NX Plus set the language to **ZPL** (or SBPL with ZPL emulation).

## Notes

- Max 500 labels per batch. Serials cannot contain `^` or `~` (ZPL control characters).
- No login: run it on a trusted network. Anyone who can open the app can print
  to any address the server can reach and change the saved data.
