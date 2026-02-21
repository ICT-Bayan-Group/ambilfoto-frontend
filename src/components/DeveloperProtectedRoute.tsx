'use client';

import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "@/services/api/auth.service";

const DeveloperAuthLoader = () => (
  <>
    <style>{`
      @keyframes shimmer {
        0%   { background-position: -600px 0; }
        100% { background-position:  600px 0; }
      }
      @keyframes blink-dot {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.25; }
      }
      .shimmer {
        background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
        background-size: 600px 100%;
        animation: shimmer 1.6s infinite linear;
        border-radius: 6px;
      }
    `}</style>

    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Sidebar skeleton */}
      <aside style={{
        width: "256px", flexShrink: 0, background: "#ffffff",
        borderRight: "1px solid #e2e8f0", padding: "24px 16px",
        display: "flex", flexDirection: "column", gap: "8px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", marginBottom: "16px" }}>
          <div className="shimmer" style={{ width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
            <div className="shimmer" style={{ height: "10px", width: "80px" }} />
            <div className="shimmer" style={{ height: "8px", width: "110px" }} />
          </div>
        </div>

        {[1, 0.85, 0.7, 0.9, 0.65, 0.75].map((opacity, i) => (
          <div key={i} className="shimmer" style={{ height: "38px", borderRadius: "8px", opacity }} />
        ))}

        <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div className="shimmer" style={{ height: "36px", borderRadius: "8px" }} />
          <div className="shimmer" style={{ height: "36px", borderRadius: "8px", opacity: 0.6 }} />
        </div>
      </aside>

      {/* Main skeleton */}
      <main style={{ flex: 1, padding: "40px 48px", display: "flex", flexDirection: "column", gap: "28px", maxWidth: "900px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div className="shimmer" style={{ height: "28px", width: "260px" }} />
            <div className="shimmer" style={{ height: "14px", width: "180px" }} />
          </div>
          <div className="shimmer" style={{ height: "32px", width: "100px", borderRadius: "20px" }} />
        </div>

        {/* 4 cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
          {[1, 0.9, 0.85, 0.8].map((op, i) => (
            <div key={i} style={{
              background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px",
              padding: "20px", opacity: op, display: "flex", flexDirection: "column", gap: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <div className="shimmer" style={{ height: "32px", width: "32px", borderRadius: "8px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div className="shimmer" style={{ height: "10px", width: "60px" }} />
                <div className="shimmer" style={{ height: "18px", width: "90px" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Usage card */}
        <div style={{
          background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px",
          padding: "24px", display: "flex", flexDirection: "column", gap: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          <div className="shimmer" style={{ height: "16px", width: "160px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="shimmer" style={{ height: "11px", width: "100px" }} />
              <div className="shimmer" style={{ height: "11px", width: "60px" }} />
            </div>
            <div className="shimmer" style={{ height: "8px", borderRadius: "4px" }} />
          </div>
        </div>

        {/* Keys card */}
        <div style={{
          background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px",
          padding: "24px", display: "flex", flexDirection: "column", gap: "14px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          <div className="shimmer" style={{ height: "16px", width: "80px" }} />
          {[1, 0.8].map((op, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "12px", padding: "14px",
              background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", opacity: op,
            }}>
              <div className="shimmer" style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                <div className="shimmer" style={{ height: "11px", width: "200px" }} />
                <div className="shimmer" style={{ height: "9px", width: "120px" }} />
              </div>
              <div className="shimmer" style={{ height: "10px", width: "80px" }} />
            </div>
          ))}
        </div>

        {/* Verifying dots */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <div style={{ display: "flex", gap: "4px" }}>
            {[0, 0.2, 0.4].map((delay, i) => (
              <div key={i} style={{
                width: "5px", height: "5px", borderRadius: "50%", background: "#cbd5e1",
                animation: `blink-dot 1.2s ${delay}s infinite`,
              }} />
            ))}
          </div>
          <span style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "monospace" }}>
            Verifying session...
          </span>
        </div>
      </main>
    </div>
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// DeveloperProtectedRoute
// ─────────────────────────────────────────────────────────────────────────────
interface DeveloperProtectedRouteProps {
  children: React.ReactNode;
}

const DeveloperProtectedRoute = ({ children }: DeveloperProtectedRouteProps) => {
  const location = useLocation();
  const [state, setState] = useState<"checking" | "ok" | "fail">("checking");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        if (!cancelled) setState("fail");
        return;
      }
      try {
        const res = await authService.verifyToken();
        if (!cancelled) setState(res?.success ? "ok" : "fail");
      } catch {
        if (!cancelled) setState("fail");
      }
    };

    check();
    return () => { cancelled = true; };
  }, [location.pathname]);

  if (state === "checking") return <DeveloperAuthLoader />;

  if (state === "fail") {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/developer/login?redirect=${returnTo}`} replace />;
  }

  return <>{children}</>;
};

export default DeveloperProtectedRoute;