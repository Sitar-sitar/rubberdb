import { describe, expect, it } from "vitest";
import ledger from "../../docs/data/product-verification.json";
import { rubbers } from "@/lib/rubberData";
import { brandHosts } from "@/lib/brands";
import publishedIds from "./publishedIds.json";

describe("公式情報の監査台帳", () => {
  it("全公開IDと1対1で対応し、未確認情報を製品データへ流入させない", () => {
    expect(ledger.schemaVersion).toBe(1);
    const ids = ledger.products.map(entry => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual([...publishedIds].sort());
    expect([...ids].sort()).toEqual(rubbers.map(rubber => rubber.id).sort());
    for (const entry of ledger.products) {
      const rubber = rubbers.find(item => item.id === entry.id)!;
      for (const field of [entry.country, entry.discontinued]) {
        expect(["confirmed", "unconfirmed"]).toContain(field.status);
        expect(field.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(new Date(field.checkedAt).toISOString().slice(0, 10)).toBe(
          field.checkedAt
        );
        expect(field.note.trim().length).toBeGreaterThan(0);
        expect(field.sources.length).toBeGreaterThan(0);
        for (const source of field.sources) {
          const url = new URL(source);
          expect(url.protocol).toBe("https:");
          expect(brandHosts[rubber.brand]).toContain(url.hostname);
        }
        if (field.status === "unconfirmed") expect(field.value).toBeNull();
      }
      if (entry.country.status === "confirmed") {
        expect(typeof entry.country.value).toBe("string");
        expect(entry.country.value).toBeTruthy();
        expect(rubber.country).toBe(entry.country.value);
      } else expect(rubber.country).toBeUndefined();
      if (entry.discontinued.status === "confirmed") {
        expect(entry.discontinued.value).toBe(true);
        expect(rubber.discontinued).toBe(true);
      } else expect(rubber.discontinued).toBeUndefined();
    }
  });
});
