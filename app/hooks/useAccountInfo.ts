import { useState, useEffect } from 'react';

interface AccountInfo {
  address: string;
  exists: boolean;
  balance: number;
  creationDate: number | null;
  creationDateFormatted: string | null;
  totalTransactions: number;
  accountInfo: {
    lamports: number;
    owner: string;
    executable: boolean;
    rentEpoch: number;
  };
}

interface UseAccountInfoResult {
  data: AccountInfo | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAccountInfo(address: string | null): UseAccountInfoResult {
  const [data, setData] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccountInfo = async () => {
    if (!address) {
      setData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/account/info?address=${address}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch account info');
      }

      const accountInfo = await response.json();
      setData(accountInfo);
    } catch (err) {
      console.error('Error fetching account info:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountInfo();
  }, [address]);

  const refresh = () => {
    fetchAccountInfo();
  };

  return {
    data,
    loading,
    error,
    refresh
  };
}