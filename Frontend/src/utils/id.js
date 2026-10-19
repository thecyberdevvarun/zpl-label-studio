// crypto.randomUUID needs a secure context (https/localhost); this also works over http on a LAN.
export const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
