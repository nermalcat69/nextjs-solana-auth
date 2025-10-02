# Next.js Solana Auth

Solana wallet authentication with Next.js.

## Setup

```bash
npm install
npm run dev
```

## Environment

Create `.env.local`:

```env
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
JWT_SECRET=your-secret-key-change-in-production
```

you can use `openssl rand -hex 64` to generate a secret key.

Open [http://localhost:3000](http://localhost:3000)
