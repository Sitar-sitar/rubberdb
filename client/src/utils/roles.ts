/**
 * 診断の役割選択肢とラベル（純粋関数）。
 * フォアとバックで同じ role でもラベルが違うため、必ず面を指定して引く（修正設計書 2026-10-01 BUG-01）。
 */
import type { Role } from "@/types/favorites";

export type Side = "fore" | "back";

export type RoleOption = {
  id: Role;
  number: string;
  label: string;
  detail: string;
};

export const foreOptions: RoleOption[] = [
  {
    id: "spin",
    number: "01",
    label: "回転ドライブ",
    detail: "弧線を作って攻めたい",
  },
  {
    id: "counter",
    number: "02",
    label: "早い攻撃",
    detail: "早い打点で押し返したい",
  },
  {
    id: "control",
    number: "03",
    label: "安定してつなぐ",
    detail: "ミスを減らして組み立てたい",
  },
];

export const backOptions: RoleOption[] = [
  {
    id: "control",
    number: "01",
    label: "安定ブロック",
    detail: "台上とブロックを安定させたい",
  },
  {
    id: "counter",
    number: "02",
    label: "早い攻撃",
    detail: "バックでも早く攻めたい",
  },
  {
    id: "spin",
    number: "03",
    label: "回転でつなぐ",
    detail: "両ハンドでドライブしたい",
  },
];

export function roleLabel(side: Side, role: Role): string {
  const options = side === "fore" ? foreOptions : backOptions;
  return options.find(option => option.id === role)?.label ?? "";
}
