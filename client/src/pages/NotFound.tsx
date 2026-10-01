import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#082a59] px-5 text-white">
      <div className="w-full max-w-lg border border-white/25 bg-[#0c3a74] p-8 text-center">
        <h1 className="font-display text-7xl font-black text-[#c7fa42]">404</h1>
        <h2 className="mt-4 text-xl font-black">ページが見つかりません</h2>
        <p className="mt-4 text-sm leading-7 text-[#d6e3f2]">
          お探しのページは移動または削除された可能性があります。
        </p>
        <button
          onClick={() => setLocation("/")}
          className="mt-8 bg-[#c7fa42] px-5 py-3 text-xs font-black text-[#082a59] transition hover:bg-white"
          type="button"
        >
          トップへ戻る
        </button>
      </div>
    </div>
  );
}
