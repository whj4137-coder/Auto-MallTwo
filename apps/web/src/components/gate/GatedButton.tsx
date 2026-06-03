import { useState } from "react";
import { useSessionStore } from "../../stores/sessionStore";
import { guardWrite } from "../../lib/gate";

// 交易按钮：DRIVING/OFFLINE 置灰（点击仍 toast 提示）；GUEST 点击弹登录续作。
// 防重复点击（change 0021）：action 返回 Promise 时置灰禁用直至 settle。
export function GatedButton({
  action, children, className = "btn", disabled = false,
}: {
  action: () => unknown;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const drive = useSessionStore((s) => s.drive);
  const net = useSessionStore((s) => s.net);
  const [pending, setPending] = useState(false);
  const blocked = drive === "DRIVING" || net === "OFFLINE";
  const cls = `${className}${blocked || disabled || pending ? " dis" : ""}`;
  return (
    <button
      className={cls}
      onClick={() => {
        if (disabled || pending) return;
        const r = guardWrite(action);
        if (r && typeof (r as { then?: unknown }).then === "function") {
          setPending(true);
          (r as Promise<unknown>).finally(() => setPending(false));
        }
      }}
    >
      {children}
    </button>
  );
}
