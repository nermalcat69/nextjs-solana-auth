'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useAccountInfo } from '../hooks/useAccountInfo';

export default function AccountInfo() {
  const { publicKey } = useWallet();
  const { data, loading, error, refresh } = useAccountInfo(publicKey?.toString() || null);

  if (!publicKey) {
    return null;
  }

  const SkeletonValue = () => (
    <div className="h-4 bg-neutral-200 rounded animate-pulse w-24"></div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 flex justify-center">
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm w-full max-w-3xl">
        <div className="px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Account Information</h2>
            <div className="flex items-center gap-2">
              <a
                href={`https://solscan.io/account/${publicKey.toString()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-sm bg-neutral-700 hover:bg-neutral-800 text-white rounded-md transition-colors"
              >
                View on Solscan
              </a>
              <button
                onClick={refresh}
                disabled={loading}
                className="px-3 py-1 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-2">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Address:</span>
                    {loading && !data ? (
                      <SkeletonValue />
                    ) : (
                      <span className="font-mono text-neutral-900 text-[10px] break-all text-right max-w-xs">
                        {data?.address}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Balance:</span>
                    {loading && !data ? (
                      <SkeletonValue />
                    ) : (
                      <span className="font-medium text-neutral-900">
                        {data?.balance.toLocaleString()} SOL
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Total Transactions:</span>
                    {loading && !data ? (
                      <SkeletonValue />
                    ) : (
                      <span className="font-medium text-neutral-900">
                        {data?.totalTransactions.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-2">Account History</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">First Seen:</span>
                    {loading && !data ? (
                      <SkeletonValue />
                    ) : data?.creationDate ? (
                      <span className="font-medium text-neutral-900">
                        {data.creationDateFormatted}
                      </span>
                    ) : (
                      <span className="text-neutral-400">Not available</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Days Active:</span>
                    {loading && !data ? (
                      <SkeletonValue />
                    ) : data?.creationDate ? (
                      <span className="font-medium text-neutral-900">
                        {(() => {
                          const nowInSeconds = Math.floor(Date.now() / 1000);
                          const daysDiff = Math.floor((nowInSeconds - data.creationDate) / (24 * 60 * 60));
                          return daysDiff < 1 ? "< 1 day" : `${daysDiff} days`;
                        })()}
                      </span>
                    ) : (
                      <span className="text-neutral-400">Not available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-2">Technical Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Owner:</span>
                    {loading && !data ? (
                      <SkeletonValue />
                    ) : (
                      <span className="font-mono text-xs text-neutral-900 break-all text-right max-w-xs">
                        {data?.accountInfo.owner}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Executable:</span>
                    {loading && !data ? (
                      <SkeletonValue />
                    ) : (
                      <span className="font-medium text-neutral-900">
                        {data?.accountInfo.executable ? 'Yes' : 'No'}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Rent Epoch:</span>
                    {loading && !data ? (
                      <SkeletonValue />
                    ) : (
                      <span className="font-medium text-neutral-900">
                        {data?.accountInfo.rentEpoch}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Lamports:</span>
                    {loading && !data ? (
                      <SkeletonValue />
                    ) : (
                      <span className="font-mono text-neutral-900">
                        {data?.accountInfo.lamports.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!loading && !data && !error && (
            <div className="text-center py-8 text-neutral-500">
              No account information available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}