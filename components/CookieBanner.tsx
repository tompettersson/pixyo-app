'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'pixyo-cookie-consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800/80 rounded-xl p-5 shadow-2xl shadow-black/40">
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          Diese Website verwendet technisch notwendige Cookies für den Betrieb der Anwendung.
          Weitere Informationen finden Sie in unserer{' '}
          <Link href="/datenschutz" className="text-[#E8710A] hover:underline">
            Datenschutzerklärung
          </Link>.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={accept}
            className="px-5 py-2 text-sm font-medium bg-[#E8710A] hover:bg-[#d4670a] text-white rounded-lg transition-colors"
          >
            Akzeptieren
          </button>
          <button
            onClick={decline}
            className="px-5 py-2 text-sm font-medium text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors"
          >
            Nur notwendige
          </button>
        </div>
      </div>
    </div>
  );
}
