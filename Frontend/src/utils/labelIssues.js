// Problems that stop a label from being printed, found before printing starts.
// Mirrors the server's checks.
const SPECS = {
  code128: {
    name: 'Code 128',
    test: /^[\x20-\x7E]+$/,
    hint: 'standard keyboard characters only',
  },
  code39: {
    name: 'Code 39',
    test: /^[0-9A-Z\-. $\/+%]+$/,
    hint: 'only capital letters A–Z, digits 0–9, space and - . $ / + %',
  },
};

// Returns a message if the label can't be printed with these settings, otherwise null.
export function getLabelIssue(serial, label) {
  if (label.codeType === 'text') {
    return label.customText ? null : 'Type the text you want to print.';
  }
  const spec = SPECS[label.codeType];
  if (!spec || spec.test.test(serial)) return null;
  return `"${serial}" can't be printed as ${spec.name}: ${spec.hint}.`;
}
