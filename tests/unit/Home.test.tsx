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
import { rubbers } from "@/lib/rubberData";
import { parseFavoriteSets } from "@/lib/favoritesStorage";

vi.mock("@/utils/recommend", async importOriginal => {
  const actual = await importOriginal<typeof import("@/utils/recommend")>();
  return {
    ...actual,
    suggestSet: vi.fn(actual.suggestSet),
    suggestOppositeSide: vi.fn(actual.suggestOppositeSide),
  };
});
beforeEach(() => {
  window.localStorage.clear();
  vi.mocked(recommend.suggestSet).mockClear();
  vi.mocked(recommend.suggestOppositeSide).mockClear();
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
  vi.mocked(recommend.suggestOppositeSide).mockReset();
  vi.mocked(recommend.suggestOppositeSide).mockImplementation(
    oppositeImplementation
  );
});
const recommendImplementation = vi
  .mocked(recommend.suggestSet)
  .getMockImplementation()!;
const oppositeImplementation = vi
  .mocked(recommend.suggestOppositeSide)
  .getMockImplementation()!;

describe("診断画面の操作と旧保存データ", () => {
  it("5つの質問をラベル付きグループとして公開し選択とフォーカスを維持する", () => {
    render(<Home />);
    for (const name of [
      "利き手",
      "診断方法",
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
    expect(
      screen.getByRole("status", { name: "カタログの検索結果" }).textContent
    ).toContain("1");
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

const defaultConditions = {
  foreRole: "spin",
  backRole: "control",
  level: "beginner",
  budget: "standard",
} as const;
function chooseFixed(side: "fore" | "back", id: string) {
  fireEvent.click(
    screen.getByRole("button", {
      name: side === "fore" ? "フォアを指定" : "バックを指定",
    })
  );
  fireEvent.change(
    screen.getByRole("combobox", {
      name: side === "fore" ? "フォアに使うラバー" : "バックに使うラバー",
    }),
    { target: { value: id } }
  );
}
function resultArea() {
  return within(document.getElementById("result")!);
}

describe("片面指定の画面と.v1保存", () => {
  it("予算freeで反対面が価格不明の場合も0円に置換しない", () => {
    const fixed = rubbers.find(r => r.id === "rozena")!;
    const unknown = rubbers.find(r => r.price === null && !r.discontinued)!;
    vi.mocked(recommend.suggestOppositeSide).mockReturnValue(
      oppositeImplementation(
        [fixed, unknown],
        { ...defaultConditions, budget: "free" },
        { side: "fore", rubberId: fixed.id }
      )
    );
    render(<Home />);
    chooseFixed("fore", fixed.id);
    fireEvent.click(screen.getByRole("button", { name: "こだわらない" }));
    expect(
      resultArea().getByText("今回購入するバックの参考価格：価格未確認")
    ).toBeTruthy();
    expect(resultArea().getByText("算出不可")).toBeTruthy();
  });
  it.each(["fore", "back"] as const)(
    "%sを指定して反対面だけを比較し、役割・経験・予算・利き手変更でも固定を保持",
    side => {
      render(<Home />);
      chooseFixed(side, "rozena");
      const fixedCard = screen.getByRole("article", {
        name: side === "fore" ? "フォアのラバー" : "バックのラバー",
      });
      expect(within(fixedCard).getByText("ロゼナ")).toBeTruthy();
      expect(within(fixedCard).getByText("あなたが指定")).toBeTruthy();
      fireEvent.click(
        screen.getByRole("button", { name: /ほかの候補も比べる/ })
      );
      expect(
        resultArea().getByText(
          side === "fore" ? "バックの候補" : "フォアの候補"
        )
      ).toBeTruthy();
      expect(
        resultArea().queryByText(
          side === "fore" ? "フォアの候補" : "バックの候補"
        )
      ).toBeNull();
      fireEvent.click(
        within(
          screen.getByRole("group", {
            name: side === "fore" ? "フォアハンド" : "バックハンド",
          })
        ).getAllByRole("button")[1]
      );
      expect(
        screen
          .getByRole("button", { name: /ほかの候補も比べる/ })
          .getAttribute("aria-expanded")
      ).toBe("false");
      fireEvent.click(
        screen.getByRole("button", { name: "試合に少し慣れてきた" })
      );
      fireEvent.click(screen.getByRole("button", { name: "6,000円まで" }));
      fireEvent.click(screen.getByRole("button", { name: "左利き" }));
      expect(
        (
          screen.getByRole("combobox", {
            name: side === "fore" ? "フォアに使うラバー" : "バックに使うラバー",
          }) as HTMLSelectElement
        ).value
      ).toBe("rozena");
      expect(
        within(
          screen.getByRole("article", {
            name: side === "fore" ? "フォアのラバー" : "バックのラバー",
          })
        ).getByText("ロゼナ")
      ).toBeTruthy();
    }
  );

  it("モードの切替で指定品を面移動し、同じモードの再押下では消さず、両面とresetで解除", () => {
    render(<Home />);
    chooseFixed("fore", "rozena");
    fireEvent.click(screen.getByRole("button", { name: "フォアを指定" }));
    expect(
      (
        screen.getByRole("combobox", {
          name: "フォアに使うラバー",
        }) as HTMLSelectElement
      ).value
    ).toBe("rozena");
    fireEvent.click(screen.getByRole("button", { name: "バックを指定" }));
    expect(
      (
        screen.getByRole("combobox", {
          name: "バックに使うラバー",
        }) as HTMLSelectElement
      ).value
    ).toBe("rozena");
    fireEvent.click(screen.getByRole("button", { name: "両面をおすすめ" }));
    expect(
      screen.queryByRole("combobox", { name: "バックに使うラバー" })
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "バックを指定" }));
    expect(
      (
        screen.getByRole("combobox", {
          name: "バックに使うラバー",
        }) as HTMLSelectElement
      ).value
    ).toBe("");
    expect(
      screen.getByRole("status", { name: "診断結果" }).textContent
    ).toContain("フォアのおすすめを表示します");
    expect(
      resultArea().queryByRole("button", { name: "このセットを保存" })
    ).toBeNull();
    chooseFixed("back", "rozena");
    fireEvent.click(screen.getByRole("button", { name: /最初から選ぶ/ }));
    expect(
      screen
        .getByRole("button", { name: "両面をおすすめ" })
        .getAttribute("aria-pressed")
    ).toBe("true");
    expect(resultArea().getAllByText("おすすめ")).toHaveLength(2);
  });

  it("指定製品の検索0件でも選択を保持し、カタログ検索へ干渉しない", () => {
    render(<Home />);
    chooseFixed("fore", "rozena");
    fireEvent.change(
      screen.getByRole("searchbox", { name: "指定するラバーを検索" }),
      { target: { value: "NO_MATCH_TEST" } }
    );
    expect(screen.getByText(/一致するラバーがありません/)).toBeTruthy();
    const select = screen.getByRole("combobox", {
      name: "フォアに使うラバー",
    }) as HTMLSelectElement;
    expect(select.value).toBe("rozena");
    expect(select.options).toHaveLength(2);
    expect(
      within(screen.getByRole("article", { name: "フォアのラバー" })).getByText(
        "ロゼナ"
      )
    ).toBeTruthy();
    expect(
      (
        screen.getByRole("searchbox", {
          name: "ラバー検索",
        }) as HTMLInputElement
      ).value
    ).toBe("");
    fireEvent.click(screen.getByRole("button", { name: "検索条件を消す" }));
    expect(select.options.length).toBeGreaterThan(2);
    fireEvent.change(select, { target: { value: "" } });
    expect(
      resultArea().queryByRole("article", { name: "バックのラバー" })
    ).toBeNull();
    expect(
      resultArea().queryByRole("button", { name: /ほかの候補も比べる/ })
    ).toBeNull();
  });

  it("廃番・価格不明・予算外の指定を保持し、価格注意と購入面の価格を表示", () => {
    render(<Home />);
    chooseFixed("fore", "clippa");
    expect(resultArea().getByText(/指定品は廃番です/)).toBeTruthy();
    const unknown = rubbers.find(r => r.price === null)!;
    chooseFixed("fore", unknown.id);
    expect(resultArea().getByText("指定品の価格は未確認です")).toBeTruthy();
    expect(resultArea().getByText("算出不可")).toBeTruthy();
    expect(
      resultArea().getByText(/今回購入するバックの参考価格/).textContent
    ).toContain("税込");
    const expensive = rubbers.find(r => r.price !== null && r.price > 8000)!;
    chooseFixed("fore", expensive.id);
    expect(
      resultArea().getByText(/指定品は選択予算を超えています/)
    ).toBeTruthy();
  });

  it("候補0件では指定カードのみ、1件では保存可・比較なし、不正IDでは再選択を案内", () => {
    const fixed = rubbers.find(r => r.id === "rozena")!;
    render(<Home />);
    chooseFixed("fore", fixed.id);
    vi.mocked(recommend.suggestOppositeSide).mockReturnValue(
      oppositeImplementation([fixed], defaultConditions, {
        side: "fore",
        rubberId: fixed.id,
      })
    );
    fireEvent.click(screen.getByRole("button", { name: "6,000円まで" }));
    expect(resultArea().getByText(/おすすめ候補0件/)).toBeTruthy();
    expect(
      resultArea().getByRole("article", { name: "フォアのラバー" })
    ).toBeTruthy();
    expect(
      resultArea().queryByRole("article", { name: "バックのラバー" })
    ).toBeNull();
    expect(
      resultArea().queryByRole("button", { name: "このセットを保存" })
    ).toBeNull();
    const other = rubbers.find(
      r =>
        r.id !== fixed.id &&
        !r.discontinued &&
        r.price !== null &&
        r.price < 6000
    )!;
    vi.mocked(recommend.suggestOppositeSide).mockReturnValue(
      oppositeImplementation([fixed, other], defaultConditions, {
        side: "fore",
        rubberId: fixed.id,
      })
    );
    fireEvent.click(screen.getByRole("button", { name: "8,000円まで" }));
    expect(resultArea().getByText("ほかの候補はありません")).toBeTruthy();
    expect(
      resultArea().getByRole("button", { name: "このセットを保存" })
    ).toBeTruthy();
    expect(
      resultArea().queryByRole("button", { name: /ほかの候補も比べる/ })
    ).toBeNull();
    vi.mocked(recommend.suggestOppositeSide).mockReturnValue({
      status: "invalidFixed",
      fixedSide: "fore",
      fixedRubberId: "missing",
    });
    fireEvent.click(screen.getByRole("button", { name: "こだわらない" }));
    expect(
      resultArea().getByRole("heading", {
        name: /指定したラバーが見つかりません/,
      })
    ).toBeTruthy();
    expect(resultArea().queryByRole("article")).toBeNull();
  });

  it("片面結果は.v1の実際の2枚を保存し、再読込・復元でbothとpinnedへ戻る", () => {
    const rendered = render(<Home />);
    chooseFixed("back", "clippa");
    expect(
      resultArea().getByText(/片面指定の設定は保存されません/)
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "このセットを保存" }));
    const raw = window.localStorage.getItem(FAVORITE_SETS_KEY);
    const saved = parseFavoriteSets(raw)[0];
    expect(saved.backId).toBe("clippa");
    expect(saved.foreId).not.toBe("clippa");
    expect(Object.keys(saved).sort()).toEqual(
      [
        "id",
        "foreId",
        "backId",
        "handedness",
        "foreRole",
        "backRole",
        "level",
        "budget",
        "createdAt",
      ].sort()
    );
    rendered.unmount();
    render(<Home />);
    expect(
      screen
        .getByRole("button", { name: "両面をおすすめ" })
        .getAttribute("aria-pressed")
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "このセットを再確認" }));
    expect(
      resultArea().getByText(/診断方法は両面おすすめに戻ります/)
    ).toBeTruthy();
    expect(resultArea().getAllByText("保存したラバー")).toHaveLength(2);
    expect(
      within(screen.getByRole("article", { name: "バックのラバー" })).getByText(
        "クリッパ"
      )
    ).toBeTruthy();
    expect(
      resultArea().queryByRole("button", { name: /ほかの候補も比べる/ })
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "現在の提案を見る" }));
    expect(resultArea().getAllByText("おすすめ")).toHaveLength(2);
    fireEvent.click(
      screen.getByRole("button", { name: "保存したセットを削除" })
    );
    expect(
      parseFavoriteSets(window.localStorage.getItem(FAVORITE_SETS_KEY))
    ).toEqual([]);
  });

  it("現在の推薦と同じ保存セットも再確認中は比較非表示", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "このセットを保存" }));
    fireEvent.click(screen.getByRole("button", { name: "このセットを再確認" }));
    expect(resultArea().getAllByText("保存したラバー")).toHaveLength(2);
    expect(
      resultArea().queryByRole("button", { name: /ほかの候補も比べる/ })
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "現在の提案を見る" }));
    expect(
      resultArea().getByRole("button", { name: /ほかの候補も比べる/ })
    ).toBeTruthy();
  });

  it("指定品の詳細モーダルを閉じると起点へフォーカスが戻る", async () => {
    render(<Home />);
    chooseFixed("fore", "rozena");
    const opener = screen.getByRole("button", {
      name: "指定したラバーの詳細を開く",
    });
    opener.focus();
    fireEvent.click(opener);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });
});
