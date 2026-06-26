"use client";

import { useEffect, useRef, useState } from "react";
import axios, { AxiosError } from "axios";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              width?: number;
              text?: "signin_with" | "signup_with" | "continue_with";
              shape?: "rectangular" | "pill" | "circle" | "square";
            },
          ) => void;
        };
      };
    };
  }
}

interface GoogleAuthButtonProps {
  mode: "login" | "register";
  className?: string;
}

export default function GoogleAuthButton({
  mode,
  className = "",
}: GoogleAuthButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError("Google client ID missing.");
      return;
    }

    const loadGoogleScript = () => {
      if (document.getElementById("google-identity-script")) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.id = "google-identity-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google script"));
        document.body.appendChild(script);
      });
    };

    const initializeGoogle = async () => {
      try {
        await loadGoogleScript();

        if (!window.google || !buttonRef.current) {
          setError("Google login unavailable.");
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              await axios.post("/api/auth/google", {
                credential: response.credential,
                mode,
              });

              window.location.href = "/";
            } catch (err) {
              if (err instanceof AxiosError) {
                setError(
                  err.response?.data?.message || "Google authentication failed.",
                );
              } else {
                setError("Google authentication failed.");
              }
            }
          },
        });

        buttonRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: 280,
          text: mode === "register" ? "signup_with" : "signin_with",
          shape: "pill",
        });
      } catch {
        setError("Google login failed to load.");
      }
    };

    initializeGoogle();
  }, [mode]);

  return (
    <div className={className}>
      <div className="flex justify-center" ref={buttonRef} />

      {error && (
        <p className="mt-2 text-center text-xs text-red-300">{error}</p>
      )}
    </div>
  );
}