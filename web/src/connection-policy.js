/** Hostname policy for direct LAN ESP32 control. No DNS or network side effects. */
export function isLocalHost(hostname) {
  if (typeof hostname !== 'string') return false;
  const host = hostname.toLowerCase().replace(/\.$/, '');
  if (host === 'localhost' || host === '::1' || host === '[::1]') return true;
  // Only syntactically valid mDNS labels; suffix matching must not admit .local.evil.
  if (host.endsWith('.local') && host.length <= 253) {
    const labels = host.split('.');
    return labels.length > 1 && labels.every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label));
  }
  if (!/^(?:0|[1-9]\d{0,2})(?:\.(?:0|[1-9]\d{0,2})){3}$/.test(host)) return false;
  const octets = host.split('.').map(Number);
  if (octets.some(value => value > 255)) return false;
  const [first, second] = octets;
  return first === 127 || first === 10 || (first === 172 && second >= 16 && second <= 31)
    || (first === 192 && second === 168);
}
