import { describe, expect, it } from "vitest";
import { roleLabel } from "@/utils/roles";

describe("roleLabel", () => {
  it("フォアは フォア側の選択肢のラベルを返す", () => {
    expect(roleLabel("fore", "spin")).toBe("回転ドライブ");
    expect(roleLabel("fore", "counter")).toBe("早い攻撃");
    expect(roleLabel("fore", "control")).toBe("安定してつなぐ");
  });

  // 再現テスト（BUG-01）: 以前はバックでもフォア側のラベルが返っていた。
  it("バックは バック側の選択肢のラベルを返す", () => {
    expect(roleLabel("back", "spin")).toBe("回転でつなぐ");
    expect(roleLabel("back", "counter")).toBe("早い攻撃");
    expect(roleLabel("back", "control")).toBe("安定ブロック");
  });
});
