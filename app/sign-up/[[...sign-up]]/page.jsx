"use client";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* vignette (edges darker) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* left & right subtle neon glows beside the card */}
        <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 w-24 h-[480px] pointer-events-none">
          <div
            className="w-full h-full rounded-xl blur-3xl opacity-60 animate-glow-left"
            style={{
              background:
                "linear-gradient(180deg, rgba(37,99,235,0.18), rgba(59,130,246,0.04) 40%, rgba(37,99,235,0))",
              mixBlendMode: "screen",
            }}
          />
        </div>

        <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 w-24 h-[480px] pointer-events-none">
          <div
            className="w-full h-full rounded-xl blur-3xl opacity-60 animate-glow-right"
            style={{
              background:
                "linear-gradient(180deg, rgba(16,185,129,0.16), rgba(34,197,94,0.03) 40%, rgba(16,185,129,0))",
              mixBlendMode: "screen",
            }}
          />
        </div>

        {/* single inner glass card (no extra text/logo) */}
        <div className="relative rounded-2xl border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.02), rgba(255,255,255,0.01))] backdrop-blur-md shadow-2xl p-6">
          <SignUp
            appearance={{
              variables: {
                colorPrimary: "#2563eb",
                colorBackground: "transparent",
                colorInputBackground: "rgba(255,255,255,0.02)",
                colorInputText: "#ffffff",
                colorText: "#e6eef8",
                colorTextSecondary: "#9ca3af",
                colorDanger: "#ef4444",
                borderRadius: "0.75rem",
                fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system",
              },
              elements: {
                // keep the widget transparent — our card provides the glass
                card: {
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  border: "none",
                },

                // remove/hide light footer panel
                footer: {
                  backgroundColor: "transparent",
                  borderTop: "none",
                  padding: "0",
                },

                // dark inputs & buttons look
                formFieldInput: {
                  backgroundColor: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  color: "#fff",
                  height: "44px",
                  borderRadius: "0.5rem",
                },
                formButtonPrimary: {
                  backgroundColor: "#2563eb",
                  "&:hover": { backgroundColor: "#1d4ed8" },
                  borderRadius: "0.6rem",
                  boxShadow: "0 8px 24px rgba(37,99,235,0.18)",
                },
                socialButtonsBlockButton: {
                  backgroundColor: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  color: "#fff",
                  padding: "0.5rem 0.9rem",
                },
                dividerLine: { backgroundColor: "transparent" },
                dividerText: { color: "#9ca3af" },
                footerActionLink: { color: "#60a5fa" },
              },
            }}
            redirectUrl="/"
            signInUrl="/sign-in"
          />
        </div>
      </div>

      <style jsx global>{`
        /* subtle vertical float for glows */
        @keyframes glowLeft {
          0% { transform: translateY(-8px) scale(1) }
          50% { transform: translateY(8px) scale(1.02) }
          100% { transform: translateY(-8px) scale(1) }
        }
        @keyframes glowRight {
          0% { transform: translateY(8px) scale(1) }
          50% { transform: translateY(-8px) scale(1.02) }
          100% { transform: translateY(8px) scale(1) }
        }
        .animate-glow-left { animation: glowLeft 7s ease-in-out infinite; }
        .animate-glow-right { animation: glowRight 8s ease-in-out infinite; }

        /* Clerk widget overrides (hide any leftover light panels / branding) */
        .clerk-root .clerk-card__footer,
        .clerk-root .clerk__footer,
        .clerk-root .clerk-card__bottom {
          background: transparent !important;
          border-top: none !important;
          box-shadow: none !important;
          color: rgba(255,255,255,0.85) !important;
        }
        .clerk-root .clerk-footer__branding,
        .clerk-root .clerk-branding {
          display: none !important;
        }
        .clerk-root .clerk-card,
        .clerk-root .clerk-root__container,
        .clerk-root .clerk-root__card {
          background: transparent !important;
          border: none !important;
        }
        .clerk-root input,
        .clerk-root .clerk-button {
          color: #fff !important;
        }
      `}</style>
    </div>
  );
}
