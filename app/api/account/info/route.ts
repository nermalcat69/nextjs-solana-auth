import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

// Use official Solana RPC with fallback options
const getRpcUrl = () => {
  if (process.env.NEXT_PUBLIC_RPC_URL) {
    return process.env.NEXT_PUBLIC_RPC_URL;
  }
  // Use official Solana mainnet RPC
  return clusterApiUrl("mainnet-beta");
};

const conn = new Connection(getRpcUrl(), { 
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 30000,
  disableRetryOnRateLimit: true,
});

// Helper function to add delays between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry function with exponential backoff
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error?.message?.includes('429') || error?.message?.includes('Too Many Requests');
      if (isRateLimit && i < maxRetries - 1) {
        const delayMs = Math.pow(2, i) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`Rate limited, retrying in ${delayMs}ms...`);
        await delay(delayMs);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }

  try {
    const publicKey = new PublicKey(address);
    
    // Get account info
    const accountInfo = await withRetry(() => conn.getAccountInfo(publicKey));
    
    if (!accountInfo) {
      return NextResponse.json({ 
        error: "Account not found",
        exists: false 
      }, { status: 404 });
    }

    // Get the first transaction (account creation) by getting all signatures and taking the last one
    const allSignatures = await withRetry(() => conn.getSignaturesForAddress(publicKey, { 
      limit: 1000 // Get more signatures to find the earliest one
    }));

    let creationDate: number | null = null;
    let lastActivityDate: number | null = null;
    
    if (allSignatures.length > 0) {
      // The last signature in the array is the oldest (first transaction)
      const firstSignature = allSignatures[allSignatures.length - 1];
      // The first signature in the array is the most recent transaction
      const lastSignature = allSignatures[0];
      
      // Get creation date from first transaction
      if (firstSignature.blockTime) {
        creationDate = firstSignature.blockTime;
      } else {
        // If blockTime is not available, try to get the transaction details
        try {
          const firstTx = await withRetry(() => conn.getTransaction(firstSignature.signature, {
            maxSupportedTransactionVersion: 0
          }));
          
          if (firstTx?.blockTime) {
            creationDate = firstTx.blockTime;
          }
        } catch (error) {
          console.warn('Could not fetch first transaction details:', error);
        }
      }
      
      // Get last activity date from most recent transaction
      if (lastSignature.blockTime) {
        lastActivityDate = lastSignature.blockTime;
      } else {
        // If blockTime is not available, try to get the transaction details
        try {
          const lastTx = await withRetry(() => conn.getTransaction(lastSignature.signature, {
            maxSupportedTransactionVersion: 0
          }));
          
          if (lastTx?.blockTime) {
            lastActivityDate = lastTx.blockTime;
          }
        } catch (error) {
          console.warn('Could not fetch last transaction details:', error);
        }
      }
    }

    // Get current SOL balance
    const balance = await withRetry(() => conn.getBalance(publicKey));

    return NextResponse.json({
      address: address,
      exists: true,
      balance: balance / 1e9, // Convert lamports to SOL
      creationDate: creationDate,
      creationDateFormatted: creationDate ? new Date(creationDate * 1000).toLocaleString() : null,
      lastActivityDate: lastActivityDate,
      lastActivityDateFormatted: lastActivityDate ? new Date(lastActivityDate * 1000).toLocaleString() : null,
      totalTransactions: allSignatures.length,
      accountInfo: {
        lamports: accountInfo.lamports,
        owner: accountInfo.owner.toString(),
        executable: accountInfo.executable,
        rentEpoch: accountInfo.rentEpoch
      }
    });

  } catch (error: any) {
    console.error('Error fetching account info:', error);
    return NextResponse.json(
      { error: "Failed to fetch account info" },
      { status: 500 }
    );
  }
}