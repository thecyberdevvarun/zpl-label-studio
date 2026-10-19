// Turns whatever was typed or pasted into the printer address box into a clean host
// (and a port, if one was included), or explains exactly what is wrong.
//   "10.100.95.109"          -> host 10.100.95.109
//   "10.100.95.109:9100"     -> host 10.100.95.109, port 9100
//   "http://10.100.95.109/"  -> host 10.100.95.109
//   " 10.100.95.109 "        -> host 10.100.95.109   (spaces, invisible characters removed)

const INVISIBLE = /[\u200B-\u200D\u2060\uFEFF]/g; // zero-width characters that sneak in when copying
const HOSTNAME = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

function describeBadCharacter(ch) {
  if (/\s/.test(ch)) return 'The address has a space inside it. Remove the space.';
  if (ch === ',') return 'Use dots (.) between the numbers, not commas.';
  if (ch === ':') return 'Use an IPv4 address like 192.168.1.50 (optionally followed by :port).';
  return `The address contains "${ch}", which isn't allowed. Use only numbers, letters, dots and dashes.`;
}

export function parsePrinterAddress(raw) {
  // NFKC turns full-width digits and non-breaking spaces into normal ones.
  let text = String(raw ?? '').normalize('NFKC').replace(INVISIBLE, '').trim();
  if (!text) {
    return { error: "The IP address box is empty. Type your printer's IP address, for example 192.168.1.50." };
  }

  text = text.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/\/.*$/, ''); // http:// and any path

  let port;
  const withPort = text.match(/^([^:]+):(\d{1,5})$/);
  if (withPort) {
    text = withPort[1];
    port = Number(withPort[2]);
  }
  text = text.replace(/\.+$/, ''); // trailing dot

  const bad = text.match(/[^A-Za-z0-9.-]/);
  if (bad) return { error: describeBadCharacter(bad[0]) };

  if (/^[\d.]+$/.test(text)) {
    const parts = text.split('.');
    const complete = parts.length === 4 && parts.every((p) => p !== '' && p.length <= 3 && Number(p) <= 255);
    if (!complete) {
      return { error: `"${text}" is not a complete IP address. It needs 4 numbers from 0 to 255, like 192.168.1.50.` };
    }
  } else if (!HOSTNAME.test(text)) {
    return { error: `"${text}" is not a valid hostname.` };
  }

  return { host: text, port };
}
