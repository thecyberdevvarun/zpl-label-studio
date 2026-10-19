const net = require('net');
const HttpError = require('../utils/HttpError');
const { SOCKET_TIMEOUT_MS, DRAIN_DELAY_MS } = require('../config');

function toPrinterError(err, { host, port }) {
  const target = `${host}:${port}`;
  switch (err.code) {
    case 'ECONNREFUSED':
      return new HttpError(502, `Connection refused at ${target}. Check that the printer is on and the port is correct.`);
    case 'EHOSTUNREACH':
    case 'ENETUNREACH':
      return new HttpError(502, `Printer at ${target} is unreachable. Check the network and the printer address.`);
    case 'ENOTFOUND':
    case 'EAI_AGAIN':
      return new HttpError(502, `Could not find a printer named "${host}". Check the address.`);
    case 'ETIMEDOUT':
      return new HttpError(502, `Connection to ${target} timed out. Check the printer address and network.`);
    default:
      return new HttpError(502, `Printer error (${target}): ${err.message}`);
  }
}

// Opens a TCP connection to the printer, optionally writes data, then closes.
function openConnection(printer, data) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let connected = false;
    let settled = false;

    const finish = (err) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      if (err) reject(err);
      else resolve();
    };

    socket.setTimeout(SOCKET_TIMEOUT_MS);
    socket.once('timeout', () => finish(toPrinterError({ code: 'ETIMEDOUT' }, printer)));
    socket.once('error', (err) => finish(toPrinterError(err, printer)));
    socket.once('close', () => {
      if (connected) finish();
      else finish(toPrinterError({ message: 'connection closed' }, printer));
    });

    socket.connect(printer.port, printer.host, () => {
      connected = true;
      if (data === undefined) return finish(); // connection test only

      socket.write(data, 'utf8', (err) => {
        if (err) return finish(toPrinterError(err, printer));
        socket.setTimeout(0);
        setTimeout(() => {
          socket.end();
          setTimeout(finish, 1000); // fallback if the printer never closes its side
        }, DRAIN_DELAY_MS);
      });
    });
  });
}

const sendToPrinter = (printer, zpl) => openConnection(printer, zpl);
const checkConnection = (printer) => openConnection(printer);

module.exports = { sendToPrinter, checkConnection };
