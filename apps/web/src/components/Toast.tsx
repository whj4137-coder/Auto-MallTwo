import { useUiStore } from "../stores/uiStore";

// 居中底部 toast（座舱风格）。单条优先级由 GateGuard 保证。
export function Toast() {
  const toasts = useUiStore((s) => s.toasts);
  if (toasts.length === 0) return null;
  return (
    <div
      style={{
        position: "absolute", left: "50%", bottom: 28, transform: "translateX(-50%)",
        zIndex: 9, display: "flex", flexDirection: "column", gap: 8, alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: "rgba(10,14,19,.94)", color: "#eef3f8", fontSize: 13,
            border: "1px solid rgba(34,211,197,.35)", borderRadius: 10, padding: "10px 18px",
            boxShadow: "0 12px 30px rgba(0,0,0,.5)", fontFamily: "var(--sans)",
          }}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
