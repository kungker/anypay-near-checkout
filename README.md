# AnyPay — Universal Checkout for NEAR

**Pay with any asset, on any chain. The merchant receives USDC on NEAR.**

AnyPay is a checkout widget for sellers who only have a NEAR wallet. The buyer pays with
whatever they already hold — ETH on Base, USDT on BNB Chain, SOL, BTC and 100+ other assets —
and NEAR Intents settles the merchant in USDC on NEAR, typically in under a minute.
No bridge UI, no wrapped-token detour, no NEAR wallet required on the buyer's side.

Built at **NEAR HACKATHON** (November 2026) for the Real-World Money, DeFi, and Autonomous
Business tracks — merchant payments and stablecoin rails, settled across chains through
NEAR Intents.
This is the "universal checkout widget" pattern: one integration for the merchant,
every asset for the buyer.

## The problem

A creator in the NEAR ecosystem sells a digital product. Her buyers live on other chains.
Today each buyer must bridge, swap, and manage gas on a chain they do not use, just to pay her —
most simply abandon the purchase. Merchants lose sales; buyers lose time and pay bridge fees
on top of the price.

## What AnyPay does

1. The merchant embeds the AnyPay checkout (this demo page is the reference integration).
2. The buyer picks the asset and chain they want to pay with and enters an amount.
3. AnyPay requests a live quote from NEAR Intents (via the 1Click API): that asset → USDC on NEAR,
   credited to the merchant's NEAR account.
4. In production, the buyer receives a one-time deposit address and sends their asset there.
   Solvers compete to fill the intent; USDC lands in the merchant's NEAR account.
   If the intent is not filled before its deadline, the deposit is refunded to the buyer's
   refund address.

## Try it (verification steps)

Requirements: Node.js 18 or newer. No dependencies to install.

```sh
node server.js
```

Then open `http://localhost:8080` in a browser.

A hosted copy also runs on GitHub Pages (link in this repository's About section). On static
hosting the page calls the 1Click API directly from the browser — the API serves
`Access-Control-Allow-Origin: *` — so the hosted demo is fully functional too; `server.js`
exists for local runs and for hosts where a same-origin proxy is preferred.

- **Do:** leave the defaults (pay with **ETH — base**, amount **0.01**, merchant `merchant.near`) and click **Get live quote**.
  **See:** a live quote — about **17.3 USDC** out (≈ $17.36), a minimum-received amount, and an
  estimated settlement time of roughly **37 seconds**. Exact numbers move with the market.
- **Do:** switch the asset to **USDT — bsc** and set the amount to **20**, then click **Get live quote** again.
  **See:** a fresh quote in USDC on NEAR for the new asset, proving the asset list and routing are
  live, not hard-coded.
- **Do:** reload the page. **See:** the asset dropdown is rebuilt from the live
  `GET /v0/tokens` response (100+ assets across NEAR, Ethereum, Base, BNB Chain, Solana and more).

The demo intentionally runs quotes with `dry: true`: prices and routes are real production
quotes, but no deposit address is issued and no funds can move. That makes the demo safe to
click through for anyone, including judges.

## How it works

- `index.html` — the checkout widget and demo store. Vanilla HTML/CSS/JS, no build step.
- `server.js` — a zero-dependency Node server. It serves the page and proxies two endpoints so
  the browser never hits CORS limits:
  - `GET /api/tokens` → `GET https://1click.chaindefuser.com/v0/tokens`
  - `POST /api/quote` → `POST https://1click.chaindefuser.com/v0/quote`
- A quote request sets `depositType: "ORIGIN_CHAIN"` (the buyer deposits on the chain they pay
  from), `recipientType: "DESTINATION_CHAIN"` (settlement to the merchant's NEAR account), a
  1% slippage tolerance, and a 10-minute deadline. Amounts are converted to the asset's smallest
  unit with `BigInt`, so no precision is lost.
- Why NEAR Intents: intents invert the usual flow. The buyer states an outcome ("merchant
  receives X USDC on NEAR") and a solver network executes it across chains. Chain abstraction
  means the buyer never touches NEAR, and the merchant never touches the buyer's chain.

## Production path (what changes after the demo)

- Request quotes with `dry: false` and show the returned one-time deposit address (and memo,
  where the origin chain needs one) as the payment instruction.
- Poll `GET /v0/status` until the intent settles, then mark the order paid and deliver the product.
- Register for a 1Click JWT to remove the standard fee markup and raise limits.
- Persist orders server-side and reconcile them against settlement status.

## Safety notes

- The demo never asks for a private key, seed phrase, or signature, and cannot move funds
  (dry quotes only).
- Refunds are structural, not a promise: an unfilled intent refunds the deposit address's
  owner at the refund address given in the quote request.

## Roadmap

- Hosted widget snippet (`<script>` embed) with merchant theming.
- Order webhooks on settlement, receipts, and multi-asset merchant settlement (USDC, NEAR, USDT).
- Optional NEAR AI-assisted support: an agent that explains a failed or slow settlement to the
  buyer in plain language using the intent status feed.

## License

MIT — see `LICENSE`.

## Team

Solo build by biggals (Agent ID `biggals.ai`, BNB Chain) with an AI coding agent, during
NEAR HACKATHON, 1–14 November 2026. All code in this repository was written during the
hackathon window; the only external service is the public NEAR Intents (1Click) API.
