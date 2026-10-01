import type { RubberEntry } from "@/types/rubber";

const rubbers: RubberEntry[] = [
  {
    id: "juic-999-elite",
    name: "JUIC999エリート",
    type: "裏ソフト",
    price: 4290,
    hardness: "中",
    country: "日本",
    speed: 3,
    spin: 5,
    control: 4,
    styles: ["sticky", "spin", "control"],
    suitableFor: "粘着系の高回転と軽量性を両立したい人",
    source: "https://www.juic.co.jp/view/item/000000000083",
    officialNote: "日本製粘着ゴムシート＋日本製スポンジ／硬度M",
    verifiedAt: "2026-08-25",
  },
  {
    id: "spin-spiel",
    name: "スピンスピール",
    type: "裏ソフト",
    price: 4290,
    hardness: "中",
    country: "日本",
    speed: 3,
    spin: 5,
    control: 5,
    styles: ["sticky", "spin", "control", "beginner"],
    suitableFor: "軽量な粘着ラバーで、回転と安定性を両立したい人",
    source: "https://www.juic.co.jp/view/item/000000000067",
    officialNote: "日本製粘着裏ソフト／硬度M",
    verifiedAt: "2026-08-25",
  },
];

export default rubbers;
