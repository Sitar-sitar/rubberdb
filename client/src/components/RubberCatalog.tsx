import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDownRight, Check, Search, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { brandTint } from "@/lib/brands";
import { rubbers, type Rubber, type RubberType } from "@/lib/rubberData";
import { formatPriceLabel } from "@/utils/price";

const types: RubberType[] = ["裏ソフト", "表ソフト", "粒高", "アンチ"];
const brands = Array.from(new Set(rubbers.map(rubber => rubber.brand))).sort();
const filterClass =
  "min-h-11 w-full min-w-0 rounded-md border border-[#aabcc9] bg-white px-2 text-sm font-bold";
const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#b5c6d3] px-3 text-sm font-bold";

type Filters = { query: string; type: string; brand: string; maxPrice: string };
const emptyFilters: Filters = { query: "", type: "", brand: "", maxPrice: "" };

export default function RubberCatalog({
  onInspect,
}: {
  onInspect: (rubber: Rubber) => void;
}) {
  const [filters, setFilters] = useState(emptyFilters);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<Rubber[]>([]);
  const [comparing, setComparing] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const compareRef = useRef<HTMLButtonElement>(null);
  const pendingDetail = useRef<Rubber | null>(null);
  const { query, type, brand, maxPrice } = filters;
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rubbers.filter(rubber => {
      const searchable =
        `${rubber.name} ${rubber.brand} ${rubber.type} ${rubber.country ?? ""} ${rubber.officialNote} ${rubber.suitableFor}`.toLowerCase();
      return (
        searchable.includes(normalized) &&
        (!type || rubber.type === type) &&
        (!brand || rubber.brand === brand) &&
        (!maxPrice ||
          (rubber.price !== null && rubber.price <= Number(maxPrice)))
      );
    });
  }, [query, type, brand, maxPrice]);
  const visible = showAll ? results : results.slice(0, 24);
  const activeFilters = [
    { key: "type", value: type, label: "種別" },
    { key: "brand", value: brand, label: "ブランド" },
    {
      key: "maxPrice",
      value: maxPrice
        ? `${Number(maxPrice).toLocaleString("ja-JP")}円まで`
        : "",
      label: "予算",
    },
  ] as const;

  function changeFilter(key: keyof Filters, value: string) {
    setFilters(current => ({ ...current, [key]: value }));
    setShowAll(false);
  }

  function toggle(rubber: Rubber) {
    setSelected(current => {
      if (current.includes(rubber))
        return current.filter(item => item !== rubber);
      return current.length < 2 ? [...current, rubber] : current;
    });
  }

  return (
    <section id="catalog" className="scroll-mt-[68px] bg-[#f1f6f9]">
      <div className="bg-[#082a59] px-5 py-6 text-white [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:34px_34px]">
        <div className="mx-auto grid max-w-[1200px] gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">
              卓球ラバーを探す
            </h1>
            <p className="mt-2 text-sm text-[#d6e3f2]">
              製品名やブランドで検索。候補を並べて比べられます。
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-[#aabcc9] bg-white pl-3 text-[#102c4b] sm:col-span-2 sm:row-start-2">
            <Search size={18} aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              aria-label="ラバー検索"
              placeholder="例：ファスターク、JOOLA、表ソフト"
              value={query}
              onChange={event => changeFilter("query", event.target.value)}
              className="min-h-11 min-w-0 flex-1 text-base [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              type="button"
              aria-label="検索語を消す"
              className="grid h-11 w-11 shrink-0 place-items-center"
              disabled={!query}
              onClick={() => {
                changeFilter("query", "");
                searchRef.current?.focus();
              }}
            >
              {query && <X size={18} aria-hidden="true" />}
            </button>
          </div>
          <a
            href="#diagnose"
            className={`${buttonClass} justify-self-start border-[#c7fa42]/60 text-[#c7fa42] sm:col-start-2 sm:row-start-1`}
          >
            フォア・バックを診断 <ArrowDownRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-[1240px] px-5 pt-4 pb-8">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <label className="grid min-w-0 gap-1 text-xs font-bold">
            種別
            <select
              aria-label="ラバーの種別"
              className={filterClass}
              value={type}
              onChange={event => changeFilter("type", event.target.value)}
            >
              <option value="">すべて</option>
              {types.map(item => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="grid min-w-0 gap-1 text-xs font-bold">
            ブランド
            <select
              className={filterClass}
              value={brand}
              onChange={event => changeFilter("brand", event.target.value)}
            >
              <option value="">すべて</option>
              {brands.map(item => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="grid min-w-0 gap-1 text-xs font-bold">
            予算（1枚）
            <select
              className={filterClass}
              value={maxPrice}
              onChange={event => changeFilter("maxPrice", event.target.value)}
            >
              <option value="">指定なし</option>
              <option value="6000">6,000円まで</option>
              <option value="8000">8,000円まで</option>
            </select>
          </label>
        </div>
        <div className="my-3 flex min-h-11 flex-wrap items-center justify-between gap-2">
          <p
            role="status"
            aria-label="カタログの検索結果"
            className="font-black"
          >
            検索結果 {results.length}件
          </p>
          <div className="flex flex-wrap gap-2">
            {activeFilters
              .filter(filter => filter.value)
              .map(filter => (
                <button
                  key={filter.key}
                  type="button"
                  className={`${buttonClass} bg-[#e4edf4]`}
                  aria-label={`${filter.label}「${filter.value}」を外す`}
                  onClick={() => {
                    changeFilter(filter.key, "");
                    searchRef.current?.focus({ preventScroll: true });
                  }}
                >
                  {filter.value} <X size={14} aria-hidden="true" />
                </button>
              ))}
          </div>
        </div>
        {maxPrice && (
          <p className="mb-3 text-sm text-[#52677a]">
            オープン価格の製品は予算で絞り込むと表示されません。
          </p>
        )}
        {results.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {visible.map(rubber => {
              const checked = selected.includes(rubber);
              return (
                <article
                  key={rubber.id}
                  className={`rounded-lg border bg-white p-3 sm:p-4 ${checked ? "border-[#86a65e]" : "border-[#cbd8e1]"}`}
                >
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-bold ${brandTint[rubber.brand]}`}
                  >
                    {rubber.brand}
                  </span>
                  <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3">
                    <h2 className="text-lg font-black">{rubber.name}</h2>
                    <p className="text-sm font-black">
                      {formatPriceLabel(rubber.price)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-[#52677a]">
                    {rubber.type} ・ 硬度{" "}
                    {rubber.hardness === "—" ? "未確認" : rubber.hardness}
                    {rubber.discontinued && " ・ 生産終了"}
                  </p>
                  <div className="mt-2 flex flex-wrap justify-between gap-2 border-t border-[#d7e0e7] pt-2">
                    <button
                      type="button"
                      className={buttonClass}
                      aria-label={`${rubber.name}の詳細を開く`}
                      onClick={() => onInspect(rubber)}
                    >
                      詳細を見る
                    </button>
                    <button
                      type="button"
                      aria-pressed={checked}
                      aria-label={`${rubber.name}を比較対象にする`}
                      className={`${buttonClass} disabled:opacity-60 ${checked ? "bg-[#eff8dc]" : ""}`}
                      disabled={!checked && selected.length === 2}
                      onClick={() => toggle(rubber)}
                    >
                      {checked && <Check size={16} aria-hidden="true" />}
                      {checked ? "比較に追加済み" : "比較に追加"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#b8c7d2] bg-white p-6 text-center">
            <p className="font-black">条件に合うラバーがありません。</p>
            <p className="mt-2 text-sm text-[#52677a]">
              検索語を変えるか、上の絞り込み条件を外してください。
            </p>
            <button
              type="button"
              className={`${buttonClass} mt-3`}
              onClick={() => {
                setFilters(emptyFilters);
                setShowAll(false);
                searchRef.current?.focus();
              }}
            >
              検索条件をリセット
            </button>
          </div>
        )}
        {results.length > visible.length && (
          <button
            className={`${buttonClass} mx-auto mt-5 flex bg-white`}
            type="button"
            onClick={() => setShowAll(true)}
          >
            残り {results.length - visible.length} モデルを表示
          </button>
        )}
      </div>
      {selected.length > 0 && (
        <div className="sticky bottom-0 z-20 border-t-2 border-[#c7fa42] bg-[#082a59] text-white">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-2 px-5 py-2">
            <div className="min-w-0 flex-1">
              <p role="status" className="text-sm font-black">
                比較対象 {selected.length}件
              </p>
              <ul className="flex flex-wrap gap-x-3 text-xs">
                {selected.map(rubber => (
                  <li key={rubber.id}>
                    <button
                      id={`remove-compare-${rubber.id}`}
                      type="button"
                      className="inline-flex min-h-11 items-center gap-1 text-left underline underline-offset-4"
                      onClick={() => {
                        const otherRubber = selected.find(
                          item => item !== rubber
                        );
                        const other =
                          otherRubber &&
                          document.getElementById(
                            `remove-compare-${otherRubber.id}`
                          );
                        (other ?? searchRef.current)?.focus({
                          preventScroll: true,
                        });
                        toggle(rubber);
                      }}
                      aria-label={`${rubber.name}を比較対象から外す`}
                    >
                      {rubber.name} <X size={14} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              ref={compareRef}
              disabled={selected.length < 2}
              className={`${buttonClass} border-[#c7fa42] bg-[#c7fa42] text-[#082a59] disabled:opacity-60`}
              onClick={() => setComparing(true)}
            >
              {selected.length === 2 ? "2製品を比較" : "もう1製品を選ぶ"}
            </button>
          </div>
        </div>
      )}
      {comparing && (
        <Dialog.Root open onOpenChange={setComparing}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[60] bg-[#061d37]/60" />
            <Dialog.Content
              aria-describedby="comparison-note"
              className="fixed inset-x-0 top-0 bottom-0 z-[60] overflow-y-auto bg-[#f1f6f9] p-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[90dvh] sm:w-[min(90vw,740px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:p-6"
              onCloseAutoFocus={event => {
                event.preventDefault();
                compareRef.current?.focus({ preventScroll: true });
                if (pendingDetail.current) {
                  onInspect(pendingDetail.current);
                  pendingDetail.current = null;
                }
              }}
            >
              <Dialog.Close className={`${buttonClass} bg-white`}>
                ‹ 検索結果に戻る
              </Dialog.Close>
              <Dialog.Title className="my-3 text-3xl font-black">
                ラバーを比較
              </Dialog.Title>
              <ComparisonTable selected={selected} />
              <p id="comparison-note" className="mt-2 text-xs text-[#52677a]">
                性能値はRubberDB内で比較するための目安です。
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {selected.map(rubber => (
                  <button
                    key={rubber.id}
                    type="button"
                    className={`${buttonClass} min-w-0 bg-white text-center break-words`}
                    onClick={() => {
                      pendingDetail.current = rubber;
                      setComparing(false);
                    }}
                  >
                    {rubber.name}の詳細
                  </button>
                ))}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </section>
  );
}

function ComparisonTable({ selected }: { selected: Rubber[] }) {
  const specs = [
    ["参考価格", (rubber: Rubber) => formatPriceLabel(rubber.price)],
    ["種別", (rubber: Rubber) => rubber.type],
    [
      "硬度",
      (rubber: Rubber) =>
        rubber.hardness === "—" ? "未確認" : rubber.hardness,
    ],
  ] as const;
  const ratings = [
    ["スピード", (rubber: Rubber) => `${rubber.speed} / 5`],
    ["回転", (rubber: Rubber) => `${rubber.spin} / 5`],
    ["扱いやすさ", (rubber: Rubber) => `${rubber.control} / 5`],
  ] as const;

  function rows(
    fields: ReadonlyArray<readonly [string, (rubber: Rubber) => string]>
  ) {
    return fields.map(([label, getValue]) => {
      const values = selected.map(getValue);
      return (
        <tr key={label} className="border-t border-[#d7e0e7]">
          <th scope="row" className="px-2 py-3 text-left">
            {label}
          </th>
          {selected.map((rubber, index) => (
            <td
              key={rubber.id}
              className={`px-2 py-3 text-center font-bold ${values[0] !== values[1] ? "bg-[#eff8dc]" : ""}`}
            >
              {values[index]}
            </td>
          ))}
        </tr>
      );
    });
  }

  return (
    <table className="w-full table-fixed border-collapse bg-white text-xs [overflow-wrap:anywhere] sm:text-sm">
      <thead className="bg-[#082a59] text-white">
        <tr>
          <th scope="col" className="w-[28%] px-2 py-3">
            比較項目
          </th>
          {selected.map(rubber => (
            <th scope="col" key={rubber.id} className="px-2 py-3">
              <span className="block text-xs font-normal text-[#d6e3f2]">
                {rubber.brand}
              </span>
              {rubber.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{rows(specs)}</tbody>
      <tbody>
        <tr>
          <th
            scope="rowgroup"
            colSpan={3}
            className="bg-[#e4edf4] px-2 py-2 text-left"
          >
            性能の目安（サイト内評価・5段階）
          </th>
        </tr>
        {rows(ratings)}
      </tbody>
    </table>
  );
}
