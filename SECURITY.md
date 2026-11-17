# Security and demonstration scope

The public Vercel application is a browser-local Simulation. It has no cloud device-control API, database credentials or connection to a physical ESP32. Local Live is available only on local origins; Cloud Live remains disabled.

## Hardware control

GPIO is disabled in the default firmware configuration. Hardware-enabled builds reject protected API requests with 503 when `HUB_API_KEY` has fewer than 12 characters. A configured key must match the request's `X-API-Key`; incorrect or absent keys return 401. Health diagnostics disclose no credential values. Use a strong unique private key and a trusted LAN; HTTP is not encrypted. Never forward the board's HTTP port to the Internet.

## Private configuration

Keep Wi-Fi/API credentials in ignored `include/config_local.h`. Keep environment files, Vercel authentication state, caches and private keys out of Git. `.env.example` and `config_local.example.h` contain no real credentials.

## Reporting a vulnerability

Do not post active credentials or exploit details in a public issue. If GitHub's private vulnerability reporting is available on this repository, use the **Security → Report a vulnerability** flow. Otherwise contact the maintainer through an existing private channel before sharing sensitive details. The project currently makes no response-time or security-certification commitment.

If a secret is discovered, keep the repository private until the affected credential is revoked/rotated and exposure is assessed. Deleting the current file does not remove historical copies or revoke a credential.
