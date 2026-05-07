import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-80 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>

      {/* 4 Summary Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-slate-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20 mb-3" />
              <div className="pt-3 border-t border-slate-100">
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-8">
          {/* Schedule Card */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-14 h-14 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-48 mb-2" />
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-8 w-24 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Announcements Card */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4 pb-6 border-b border-slate-100 last:border-0">
                    <Skeleton className="w-1 h-20 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-64 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4 mb-3" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Skeleton */}
        <div className="lg:col-span-3 space-y-8">
          <Card className="bg-slate-900 border-none shadow-xl">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-slate-700" />
              <Skeleton className="h-4 w-48 bg-slate-700" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-800">
                    <Skeleton className="h-4 w-full mb-2 bg-slate-700" />
                    <Skeleton className="h-3 w-24 mb-3 bg-slate-700" />
                    <Skeleton className="h-8 w-full bg-slate-700" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function ClassListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between border border-slate-100 rounded-lg">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-5 w-64 mb-2" />
              <Skeleton className="h-4 w-48 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {[...Array(cols)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {[...Array(cols)].map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
