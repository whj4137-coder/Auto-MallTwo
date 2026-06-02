import { useSessionStore } from "../../stores/sessionStore";
import { guardWrite } from "../../lib/gate";

// 交易按钮：DRIVING/OFFLINE 置灰（点击仍 toast 提示）；GUEST 点击弹登录续作。
export function GatedButton({
  action, children, className = "btn", disabled = false,
}: {
  action: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const drive = useSessionStore((s) => s.drive);
  const net = useSessionStore((s) => s.net);
  const blocked = drive === "DRIVING" || net === "OFFLINE";
  const cls = `${className}${blocked || disabled ? " dis" : ""}`;
  return (
    <button
      className={cls}
      onClick={() => {
        if (disabled) return;
        guardWrite(action);
      }}
    >
      {children}
    </button>
  );
}
