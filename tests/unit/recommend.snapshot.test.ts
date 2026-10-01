import { describe, expect, it } from "vitest";
import { rubbers } from "@/lib/rubberData";
import {
  BUDGET_VALUES,
  LEVEL_VALUES,
  ROLE_VALUES,
} from "@/types/favorites";
import { suggestSet } from "@/utils/recommend";

/**
 * 診断結果の固定（修正設計書 2026-10-01 M-04）。
 * 製品の追加やスコア変更で提案が変わるとここが落ちる。
 * 変化が意図どおりなら `pnpm test -u` で更新し、スナップショットの差分をコミットに含める。
 */
describe("診断結果のスナップショット", () => {
  it("全 54 通りの条件で、提案と上位候補が変わらない", () => {
    const lines: string[] = [];
    for (const level of LEVEL_VALUES) {
      for (const budget of BUDGET_VALUES) {
        for (const foreRole of ROLE_VALUES) {
          for (const backRole of ROLE_VALUES) {
            const result = suggestSet(rubbers, {
              foreRole,
              backRole,
              level,
              budget,
            });
            const top = (list: typeof result.foreList) =>
              list
                .slice(0, 4)
                .map(rubber => rubber.id)
                .join(",");
            lines.push(
              `${level}/${budget}/fore:${foreRole}/back:${backRole} => ` +
                `${result.fore.id} + ${result.back.id} | ` +
                `fore[${top(result.foreList)}] back[${top(result.backList)}]`
            );
          }
        }
      }
    }
    expect(lines).toHaveLength(54);
    expect(lines.join("\n")).toMatchSnapshot();
  });
});
