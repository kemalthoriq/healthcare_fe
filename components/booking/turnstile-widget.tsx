"use client";

import { useEffect, useRef, useState } from "react";
import { CircleAlert } from "lucide-react";

type TurnstileOptions = {
  sitekey: string;
  language?: string;
  theme?: "light" | "dark" | "auto";
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: TurnstileOptions) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (window.turnstile) {
    return Promise.resolve();
  }
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        script.remove();
        reject(new Error("turnstile script failed to load"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

type TurnstileWidgetProps = {
  siteKey: string;
  onToken: (token: string | null) => void;
};

export function TurnstileWidget({ siteKey, onToken }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let widgetId: string | undefined;

    loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) {
          return;
        }
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          language: "id",
          theme: "light",
          callback: (token) => onToken(token),
          "expired-callback": () => onToken(null),
          "error-callback": () => onToken(null),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
      onToken(null);
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [siteKey, onToken]);

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="min-h-[65px]" />
      {failed && (
        <p role="alert" className="flex items-start gap-1.5 text-sm text-danger">
          <CircleAlert aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0" />
          Verifikasi keamanan tidak dapat dimuat. Periksa koneksi Anda lalu muat ulang halaman.
        </p>
      )}
    </div>
  );
}
