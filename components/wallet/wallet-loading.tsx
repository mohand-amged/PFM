import React from 'react';
import { Card } from '@/components/ui/card';

export default function WalletLoading() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header Loading */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-72 animate-pulse"></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="h-12 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards Loading */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg animate-pulse mr-3 sm:mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Budget Progress Loading */}
      <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
      </Card>

      {/* Content Cards Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Income Card Loading */}
        <Card className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Summary Card Loading */}
        <Card className="p-4 sm:p-6">
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t">
            <div className="flex gap-3">
              <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
