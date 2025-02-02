'use client';

import React from 'react';

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 p-6 bg-white">
      {children}
    </div>
  );
}
