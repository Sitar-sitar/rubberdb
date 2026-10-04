// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import Home from "@/pages/Home";
import * as recommend from "@/utils/recommend";
import { FAVORITE_SETS_KEY } from "@/lib/favoritesStorage";

vi.mock("@/utils/recommend", async importOriginal => {
  const actual = await importOriginal<typeof import("@/utils/recommend")>();
  return { ...actual, suggestSet: vi.fn(actual.suggestSet) };
});
beforeEach(() => {
  window.localStorage.clear();
  vi.mocked(recommend.suggestSet).mockClear();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({ matches: true })),
  });
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.mocked(recommend.suggestSet).mockReset();
  vi.mocked(recommend.suggestSet).mockImplementation(recommendImplementation);
});
const recommendImplementation = vi
  .mocked(recommend.suggestSet)
  .getMockImplementation()!;

describe("診断画面の操作と旧保存データ", () => {
  it("5つの質問をラベル付きグループとして公開し選択とフォーカスを維持する", () => {
    render(<Home />);
    for (const name of [
      "利き手",
      "フォアハンド",
      "バックハンド",
      "卓球の経験",
      "片面あたりの予算",
    ]) {
      const group = screen.getByRole("group", { name });
      expect(
        within(group).getAllByRole("button", { pressed: true })
      ).toHaveLength(1);
    }
    const left = screen.getByRole("button", { name: "左利き" });
    left.focus();
    fireEvent.click(left);
    fireEvent.click(left);
    expect(left.getAttribute("aria-pressed")).toBe("true");
    expect(document.activeElement).toBe(left);
    expect(
      screen
        .getByRole("button", { name: "右利き" })
        .getAttribute("aria-pressed")
    ).toBe("false");
  });
  it("比較領域を常設し展開状態を伝え、検索件数と未確認国を表示する", async () => {
    render(<Home />);
    const toggle = screen.getByRole("button", { name: /ほかの候補も比べる/ });
    const region = document.getElementById(
      toggle.getAttribute("aria-controls")!
    );
    expect(region?.hidden).toBe(true);
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(region?.hidden).toBe(false);
    fireEvent.change(screen.getByRole("searchbox", { name: "ラバー検索" }), {
      target: { value: "ブルーグリップ J1" },
    });
    expect(screen.getByRole("status").textContent).toContain("1");
    const opener = screen.getByRole("button", {
      name: /ブルーグリップ J1の詳細を開く/,
    });
    opener.focus();
    fireEvent.click(opener);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("未確認")).toBeTruthy();
    const favorite = within(dialog).getByRole("button", {
      name: "お気に入りに保存",
    });
    expect(favorite.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(favorite);
    expect(
      within(dialog)
        .getByRole("button", { name: "お気に入りから外す" })
        .getAttribute("aria-pressed")
    ).toBe("true");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });
  it.each([0, 1])(
    "候補%i件では保存・比較の代わりに条件変更を案内する",
    count => {
      vi.mocked(recommend.suggestSet).mockReturnValue({
        status: "insufficient",
        candidateCount: count,
        excludedUnknownPriceCount: 0,
        excludedDiscontinuedCount: 1,
      });
      render(<Home />);
      expect(screen.getByText(/該当する製品は/).textContent).toContain(
        String(count)
      );
      expect(
        screen.queryByRole("button", { name: "このセットを保存" })
      ).toBeNull();
      expect(
        screen.queryByRole("button", { name: /ほかの候補も比べる/ })
      ).toBeNull();
      expect(screen.getByRole("link", { name: "予算を選び直す" })).toBeTruthy();
    }
  );
  it("旧v1保存セットの廃番IDを保持し、候補不足でも復元して現在条件へ戻れる", async () => {
    window.localStorage.setItem(
      FAVORITE_SETS_KEY,
      JSON.stringify([
        {
          id: "right-clippa-rozena-spin-control-beginner-standard",
          foreId: "clippa",
          backId: "rozena",
          handedness: "right",
          foreRole: "spin",
          backRole: "control",
          level: "beginner",
          budget: "standard",
          createdAt: "2026-10-01T00:00:00Z",
        },
      ])
    );
    vi.mocked(recommend.suggestSet).mockReturnValue({
      status: "insufficient",
      candidateCount: 1,
      excludedUnknownPriceCount: 0,
      excludedDiscontinuedCount: 1,
    });
    render(<Home />);
    const restore = screen.getByRole("button", { name: "このセットを再確認" });
    restore.focus();
    fireEvent.click(restore);
    expect(document.activeElement).toBe(restore);
    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
        behavior: "auto",
        block: "start",
      })
    );
    expect(screen.queryByText(/該当する製品は/)).toBeNull();
    expect(screen.getAllByText(/廃番/).length).toBeGreaterThan(0);
    expect(
      screen.queryByRole("button", { name: /ほかの候補も比べる/ })
    ).toBeNull();
    const current = screen.getByRole("button", { name: "現在の提案を見る" });
    fireEvent.click(current);
    expect(screen.getByText(/該当する製品は/)).toBeTruthy();
    expect(window.localStorage.getItem(FAVORITE_SETS_KEY)).toContain("clippa");
  });
});
