'use client';
import { useEffect } from 'react';

export default function SW() {
  useEffect(() => {
    const secure = location.protocol === 'https:' || location.hostname === 'localhost';
    if (secure && 'serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
  return null;
}
