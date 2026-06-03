import { useNavigate } from "react-router-dom";
import { COPY } from "@apex/shared";
import type { LoadStatus } from "../lib/useLoad";

// §15.9.1 页面加载三态：首次加载骨架 / 错误可重试(COPY-037+COPY-047) / 4004 未找到(COPY-036+返回)。
// 仅在 status!=="ok" 时渲染；与各页 <main> 同层。
export function PageFallback({ status, onRetry }: { status: LoadStatus; onRetry: () => void }) {
  const nav = useNavigate();

  if (status === "loading") {
    // 轻量骨架：标题条 + 若干卡片占位
    return (
      <main className="main lpad">
        <div className="skel-wrap" aria-busy="true">
          <div className="skel skel-title" />
          <div className="skel-row">
            <div className="skel skel-card" />
            <div className="skel skel-card" />
            <div className="skel skel-card" />
          </div>
        </div>
      </main>
    );
  }

  if (status === "notfound") {
    return (
      <main className="main">
        <div className="empty" style={{ gap: 14 }}>
          <div className="et">{COPY.C036_NOT_FOUND}</div>
          <button className="btn ghost" onClick={() => nav(-1)}>{COPY.C044_BACK}</button>
        </div>
      </main>
    );
  }

  // error（5000 / 网络合成码 / 其它）——toast 已由 http 层抛出，这里给可重试入口
  return (
    <main className="main">
      <div className="empty" style={{ gap: 14 }}>
        <div className="et">{COPY.C037_SERVER}</div>
        <button className="btn" onClick={onRetry}>{COPY.C047_RETRY}</button>
      </div>
    </main>
  );
}
