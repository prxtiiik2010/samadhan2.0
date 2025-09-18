import { useEffect, useRef, useState } from "react";

// Lightweight Google reCAPTCHA v2 checkbox wrapper without extra deps
// Usage:
// <ReCaptcha onVerify={(token) => setRecaptchaToken(token)} />
// Ensure VITE_RECAPTCHA_SITE_KEY is set in .env

declare global {
  interface Window {
    grecaptcha?: any;
    _recaptchaOnLoad?: () => void;
  }
}

interface Props {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: "light" | "dark";
  size?: "normal" | "compact";
}

export default function ReCaptcha({ onVerify, onExpire, theme = "light", size = "normal" }: Props) {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
  const isEnterprise = String(import.meta.env.VITE_RECAPTCHA_ENTERPRISE || "false").toLowerCase() === "true";
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!siteKey) {
      // eslint-disable-next-line no-console
      console.warn("VITE_RECAPTCHA_SITE_KEY is not set");
      return;
    }

    const ensureScript = () => {
      const hasClassic = !!window.grecaptcha?.render;
      const hasEnterprise = !!window.grecaptcha?.enterprise?.render;
      if ((isEnterprise && hasEnterprise) || (!isEnterprise && hasClassic)) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        const src = isEnterprise
          ? "https://www.google.com/recaptcha/enterprise.js?onload=_recaptchaOnLoad&render=explicit"
          : "https://www.google.com/recaptcha/api.js?onload=_recaptchaOnLoad&render=explicit";
        const existing = document.querySelector<HTMLScriptElement>(`script[src='${src}']`) ||
          document.querySelector<HTMLScriptElement>("script[src*='recaptcha/enterprise.js']") ||
          document.querySelector<HTMLScriptElement>("script[src*='recaptcha/api.js']");
        if (existing) {
          existing.addEventListener("load", () => resolve());
          // If already loaded
          if ((isEnterprise && window.grecaptcha?.enterprise?.render) || (!isEnterprise && window.grecaptcha?.render)) resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.defer = true;
        window._recaptchaOnLoad = () => resolve();
        document.body.appendChild(script);
      });
    };

    const renderWidget = async () => {
      await ensureScript();
      if (!widgetRef.current || rendered) return;
      try {
        const api = isEnterprise ? window.grecaptcha.enterprise : window.grecaptcha;
        const id = api.render(widgetRef.current, {
          sitekey: siteKey,
          theme,
          size,
          callback: (token: string) => onVerify(token),
          'expired-callback': () => onExpire?.(),
        });
        if (typeof id === "number") setRendered(true);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("reCAPTCHA render failed", e);
      }
    };

    renderWidget();
  }, [onVerify, onExpire, theme, size, rendered, isEnterprise]);

  if (!siteKey) return null;
  return <div ref={widgetRef} />;
}
