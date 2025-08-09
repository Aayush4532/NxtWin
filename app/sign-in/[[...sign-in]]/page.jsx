"use client";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* subtle vignette so edges are darker */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* left & right side glow (only around the sign-in card) */}
        <div className="absolute -left-14 top-1/2 transform -translate-y-1/2 w-28 h-[420px] pointer-events-none">
          <div className="w-full h-full rounded-xl blur-3xl opacity-60 animate-glow-left"
               style={{
                 background:
                   "linear-gradient(180deg, rgba(37,99,235,0.18), rgba(59,130,246,0.06) 40%, rgba(37,99,235,0))",
                 mixBlendMode: "screen",
               }}
          />
        </div>

        <div className="absolute -right-14 top-1/2 transform -translate-y-1/2 w-28 h-[420px] pointer-events-none">
          <div className="w-full h-full rounded-xl blur-3xl opacity-60 animate-glow-right"
               style={{
                 background:
                   "linear-gradient(180deg, rgba(16,185,129,0.16), rgba(34,197,94,0.05) 40%, rgba(16,185,129,0))",
                 mixBlendMode: "screen",
               }}
          />
        </div>

        {/* Single inner glass card */}
        <div className="relative rounded-2xl border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.02), rgba(255,255,255,0.01))] backdrop-blur-md shadow-2xl p-6">
          <SignIn
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
                card: {
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  border: "none",
                },
                footer: {
                  backgroundColor: "transparent",
                  borderTop: "none",
                  padding: "0",
                },
                footerActionLink: { color: "#60a5fa" },
                footerSecondary: { color: "#9ca3af", backgroundColor: "transparent" },
                dividerLine: { backgroundColor: "transparent" },
                dividerText: { color: "#9ca3af" },
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
              },
            }}
            redirectUrl="/"
            signUpUrl="/sign-up"
          />
        </div>
      </div>

      <style jsx global>{`
        /* glow animations */
        @keyframes glowLeft {
          0% { transform: translateY(-6px) scale(1) }
          50% { transform: translateY(6px) scale(1.03) }
          100% { transform: translateY(-6px) scale(1) }
        }
        @keyframes glowRight {
          0% { transform: translateY(6px) scale(1) }
          50% { transform: translateY(-6px) scale(1.03) }
          100% { transform: translateY(6px) scale(1) }
        }
        .animate-glow-left { animation: glowLeft 6s ease-in-out infinite; }
        .animate-glow-right { animation: glowRight 7s ease-in-out infinite; }

        /* Clerk widget overrides to remove leftover light panels/branding */
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
