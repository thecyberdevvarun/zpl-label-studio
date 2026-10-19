# ZPL Label Studio

Print QR code and barcode labels with serial-number ranges, plus your own text,
to any ZPL network printer (built for the SATO CL4NX Plus). React front end,
Node.js/Express back end.

- **Printers are chosen in the browser.** Nothing about a printer is hard-coded
  on the server; the selected printer's address is sent with every print.
- **Everything you save lives in the `database/` folder** (printers, templates,
  your current serial range and label settings), not in the browser.
- **A dashboard-style web app**: a sidebar with Dashboard, Print labels, Templates,
  Printers and History pages, a top bar with the active printer, and a footer.
- **QR code, barcode or text only.** Pick QR code, Code 128, Code 39, or *Text only*
  (just your custom text, no code and no serial) for each print job.
- **The serial prints once.** You choose whether it goes on the **top, bottom,
  left or right** of the code.
- **Left, centre or right.** Place the code and text on the left, in the centre or on
  the right of the label.
- **Custom text** such as "Software Trial" prints on every label, on the top,
  bottom, left or right of the code and serial.

## Quick start

```bash
npm run build         # installs all dependencies and builds the React app
npm run dev                      # API on :3001 (nodemon)
npm run dev --prefix Frontend    # React dev server on http://localhost:5173 (second terminal)
```

Open http://localhost:5173, click **Add a printer**, enter its IP address
(port 9100 is pre-filled), and press **Test connection**.

The address box is forgiving: spaces, `http://`, a trailing dot or `:9100` after
the IP are cleaned up automatically (a port typed after the IP is used as the
port). If something can't work, the message says exactly what is wrong.

### Production (one process)

```bash
npm run build         # builds the React app into Frontend/dist
npm start             # serves the app + API on http://localhost:3001
```

Change the port with `PORT=8080 npm start`.


## The pages

| Page | What it does |
|------|--------------|
| **Dashboard** | Totals (labels printed, jobs, templates, printers), the active printer's status, recent print jobs, quick actions |
| **Print labels** | Design and print: serial range, content, layout, label size, with a live preview and print log that stay in view |
| **Templates** | Saved label setups as cards. *Use template* loads one into the Print page |
| **Printers** | Add, edit, test, remove printers and choose the one in use (address, port, print resolution) |
| **History** | Every print job: when, printer, type, serials, number of labels, result |

A print job keeps running if you open another page while it prints.

## The database folder

```
database/
├── printers.json     saved printers (address, port, resolution) + which one is in use
├── templates.json    saved templates (serial range + label settings)
├── settings.json     the serial range and label settings you are working on
└── history.json      finished print jobs (the latest 500)
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

Everything is set in *Label settings*:

- **Label type**: QR code, Barcode (Code 128), Barcode (Code 39) or Text only.
  - *Code 128*: letters, numbers and symbols (standard keyboard characters).
  - *Code 39*: capital letters, digits, space and `- . $ / + %` only. If the
    serial has other characters (for example lowercase letters) the app tells
    you and won't print.
  - QR uses *QR code size*; barcodes use *Bar width* and *Barcode height*.
  - Barcodes print without their own text line: the serial is printed once,
    where you choose.
- **Serial text position**: top, bottom, left or right of the code.
- **Custom text**: any text up to 60 characters (letters, numbers and common
  symbols; `^ ~ \` are not allowed). It is placed on the top, bottom, left or
  right of the code + serial group and has its own size. Leave it empty for none.
- **Label size**: pick a common size (30 × 20 mm … 100 × 150 mm) or type your
  own width and height in **millimetres or inches**. The app turns it into
  printer dots using the **Print resolution (dpi)** of the selected printer, and
  shows the result ("That is 591 × 472 dots at 300 dpi"). Set the resolution when
  you add or edit a printer (most label printers are 203 dpi; SATO uses 305/609
  instead of 300/600). The size is saved with templates, so a template remembers
  its label stock.
- **Text only**: prints just the custom text at the margins. There is no serial
  range; **Number of labels to print** sets how many labels come out.
- **Alignment**: left, centre or right. The code and text are placed as one group on
  that side of the label. Stacked items line up the same way (centred items share a
  centre line; right-aligned items share a right edge), and centred or right-aligned
  text is justified against the label itself, so it stays exact.
- **Spacing**, **Side margin / Top margin** (under *Margins*) control the gaps and where
  everything starts on the label (the side margin is measured from the right edge when
  aligned right, and is not used when centred). These, the text size and the QR/bar sizes are in
  dots, so they get physically smaller on a higher-resolution printer; the label
  size itself stays the same physical size.

How it works: the serial is placed next to the code, then the custom text is
placed next to that group. The preview is drawn from the same layout the server
uses to build the ZPL.

- Text width is **estimated** (used to place things when text is on the left,
  and to warn if something may not fit). If spacing isn't what you want on the
  real label, adjust *Spacing* or the margins.
- Barcodes need empty space on both sides (about 10 bars wide) to scan. The
  preview warns if the margin or spacing is too small.

## Project structure

```
QR-Label-Printer/
├── package.json              scripts that run both apps
├── database/                 saved printers, templates, settings (JSON)
├── Backend/                   Node.js + Express API
│   └── src/
│   ├── server.js         starts the server (entry point)
│       ├── app.js            express setup, serves Frontend/dist in production
│       ├── app.js            express setup, serves Frontend/dist in production
│       ├── config/           PORT, database folder, socket timeouts
│       ├── routes/           URL → controller
│       ├── controllers/      request handling
│       ├── repositories/     read/write printers, templates, settings, history
│       ├── services/
│       │   ├── database.service.js  JSON file storage (queued, atomic writes)
│       │   ├── layout.service.js    where the code, text and alignment go
│       │   ├── zpl.service.js       builds the ZPL for a label
│       │   ├── code.service.js      QR / Code 128 / Code 39 encoding
│       │   ├── qr.service.js        QR matrix
│       │   └── printer.service.js   TCP connection to the printer
│       ├── middleware/       error handling
│       └── utils/            input validation, HttpError
└── Frontend/                   React + Vite + Tailwind CSS
    └── src/
        ├── api/              fetch wrapper, print API, database API
        ├── components/       layout (sidebar, top bar, footer), printers, serial, label,
        │                     print, history, ui
        ├── context/          PrinterContext (printers + live status),
        │                     StudioContext (current label, templates, print job, history)
        ├── hooks/            usePrinters, useTemplates, useSettings, useLabelPreview,
        │                     usePrinterStatus, usePrintJob
        ├── pages/            Dashboard, Print, Templates, Printers, History
        ├── utils/            serial range, label helpers, one-time migration
        └── constants/        defaults
```

Libraries: Tailwind CSS v4, `react-router-dom`, `react-icons`, `react-hot-toast` (client); `qrcode`, `jsbarcode` (server).

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET / POST | `/api/printers` | List / add a printer `{ name, host, port, dpi }` |
| PUT / DELETE | `/api/printers/:id` | Edit / remove a printer |
| PUT | `/api/printers/selected` | Choose the printer in use `{ id }` |
| POST | `/api/printers/status` | Test a connection `{ printer: {host, port} }` |
| GET / POST | `/api/templates` | List / save a template (same name overwrites) |
| PATCH | `/api/templates/:id/printed` | Record the last printed range |
| DELETE | `/api/templates/:id` | Delete a template |
| GET / PUT | `/api/settings` | Current serial range + label settings |
| GET / POST / DELETE | `/api/history` | List / record / clear finished print jobs |
| POST | `/api/print/label` | Print one serial `{ printer, serial, label? }` |
| POST | `/api/print/preview` | ZPL + layout for one serial `{ serial, label? }` |

`label` accepts (all sizes in printer dots): `labelWidth`, `labelHeight`, `codeType` (`qr|code128|code39`),
`qrSize`, `barWidth`, `barHeight`, `marginLeft`, `marginTop`, `fontSize`,
`textGap`, `align` (`left|center|right`), `textPosition` (`top|bottom|left|right`), `customText`,
`customTextPosition`, `customFontSize`, `copies`. The server validates every value.

## Printer setup

The printer must accept raw ZPL on TCP port 9100 (or the port you enter).
On the CL4NX Plus set the language to **ZPL** (or SBPL with ZPL emulation).

## Notes

- Max 500 labels per batch. Serials cannot contain `^` or `~` (ZPL control characters).
- To add another barcode type later (EAN-13, Data Matrix, ...): add it to `Backend/src/services/code.service.js` and give it a ZPL command in `zpl.service.js`.
- No login: run it on a trusted network. Anyone who can open the app can print
  to any address the server can reach and change the saved data.
<<<<<<< HEAD
=======

```
zpl-label-studio
├─ Frontend
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ src
│  │  ├─ api
│  │  │  ├─ databaseApi.js
│  │  │  ├─ http.js
│  │  │  └─ printApi.js
│  │  ├─ App.jsx
│  │  ├─ components
│  │  │  ├─ history
│  │  │  │  └─ JobsTable.jsx
│  │  │  ├─ label
│  │  │  │  ├─ ContentSettings.jsx
│  │  │  │  ├─ LabelPreview.jsx
│  │  │  │  ├─ LayoutSettings.jsx
│  │  │  │  ├─ SizeSettings.jsx
│  │  │  │  └─ ZplModal.jsx
│  │  │  ├─ layout
│  │  │  │  ├─ AppShell.jsx
│  │  │  │  ├─ Footer.jsx
│  │  │  │  ├─ PrinterSelector.jsx
│  │  │  │  ├─ Sidebar.jsx
│  │  │  │  ├─ StatusDot.jsx
│  │  │  │  ├─ StatusScreen.jsx
│  │  │  │  └─ TopBar.jsx
│  │  │  ├─ print
│  │  │  │  └─ PrintMonitor.jsx
│  │  │  ├─ printers
│  │  │  │  └─ PrinterFormModal.jsx
│  │  │  ├─ serial
│  │  │  │  ├─ SerialPartsInput.jsx
│  │  │  │  ├─ SerialRangeForm.jsx
│  │  │  │  └─ TemplateManager.jsx
│  │  │  └─ ui
│  │  │     ├─ Badge.jsx
│  │  │     ├─ Button.jsx
│  │  │     ├─ Card.jsx
│  │  │     ├─ EmptyState.jsx
│  │  │     ├─ Field.jsx
│  │  │     ├─ Modal.jsx
│  │  │     └─ SegmentedControl.jsx
│  │  ├─ constants
│  │  │  └─ defaults.js
│  │  ├─ context
│  │  │  ├─ PrinterContext.jsx
│  │  │  └─ StudioContext.jsx
│  │  ├─ hooks
│  │  │  ├─ useHistory.js
│  │  │  ├─ useLabelPreview.js
│  │  │  ├─ usePrinters.js
│  │  │  ├─ usePrinterStatus.js
│  │  │  ├─ usePrintJob.js
│  │  │  ├─ useSettings.js
│  │  │  └─ useTemplates.js
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ DashboardPage.jsx
│  │  │  ├─ HistoryPage.jsx
│  │  │  ├─ NotFoundPage.jsx
│  │  │  ├─ PrintersPage.jsx
│  │  │  ├─ PrintPage.jsx
│  │  │  └─ TemplatesPage.jsx
│  │  └─ utils
│  │     ├─ format.js
│  │     ├─ id.js
│  │     ├─ label.js
│  │     ├─ labelIssues.js
│  │     ├─ migrateLocalStorage.js
│  │     ├─ printerAddress.js
│  │     └─ serial.js
│  └─ vite.config.js
├─ database
├─ package.json
├─ README.md
└─ Backend
   ├─ package-lock.json
   ├─ package.json
   └─ src
      ├─ app.js
      ├─ config
      │  └─ index.js
      ├─ controllers
      │  ├─ history.controller.js
      │  ├─ print.controller.js
      │  ├─ printer.controller.js
      │  ├─ settings.controller.js
      │  └─ template.controller.js
      ├─ index.js
      ├─ middleware
      │  └─ errorHandler.js
      ├─ repositories
      │  ├─ history.repository.js
      │  ├─ printers.repository.js
      │  ├─ settings.repository.js
      │  └─ templates.repository.js
      ├─ routes
      │  ├─ history.routes.js
      │  ├─ index.js
      │  ├─ print.routes.js
      │  ├─ printer.routes.js
      │  ├─ settings.routes.js
      │  └─ template.routes.js
      ├─ services
      │  ├─ code.service.js
      │  ├─ database.service.js
      │  ├─ layout.service.js
      │  ├─ printer.service.js
      │  ├─ qr.service.js
      │  └─ zpl.service.js
      └─ utils
         ├─ HttpError.js
         └─ validators.js

```
>>>>>>> 650b84d (Change the application layout inplement the dashbaord layout and folder structure as database to store the data and history)
