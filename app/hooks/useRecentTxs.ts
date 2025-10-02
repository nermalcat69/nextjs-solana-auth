import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface TransactionItem {
  signature: string;
  slot: number;
  blockTime: number | null;
  err: any;
  status: 'success' | 'failed';
  fee: number | null;
  preBalances: number[] | null;
  postBalances: number[] | null;
  type: string;
  amount?: number;
  from?: string;
  to?: string;
}

interface TransactionData {
  items: TransactionItem[];
  nextCursor: string | null;
}

export function useRecentTxs(limit = 20) {
  const { publicKey, connected } = useWallet();
  const [data, setData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (before?: string) => {
    if (!connected || !publicKey) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        address: publicKey.toBase58(),
        limit: limit.toString(),
      });

      if (before) {
        params.append('before', before);
      }

      const response = await fetch(`/api/tx/recent?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setData(result);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, limit]);

  const loadMore = useCallback(async () => {
    if (!data?.nextCursor || loading) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        address: publicKey!.toBase58(),
        limit: limit.toString(),
        before: data.nextCursor,
      });

      const response = await fetch(`/api/tx/recent?${params}`);
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setData(prev => ({
        items: [...(prev?.items || []), ...result.items],
        nextCursor: result.nextCursor,
      }));
    } catch (err) {
      console.error('Error loading more transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more transactions');
    } finally {
      setLoading(false);
    }
  }, [data?.nextCursor, loading, publicKey, limit]);

  const refresh = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchTransactions();
    } else {
      setData(null);
      setError(null);
    }
  }, [connected, publicKey, fetchTransactions]);

  return {
    data,
    loading,
    error,
    refresh,
    loadMore,
    hasMore: !!data?.nextCursor,
  };
}