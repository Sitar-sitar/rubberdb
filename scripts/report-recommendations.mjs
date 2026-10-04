import { loadTsModule } from "./lib/load-ts-module.mjs";

const { rubbers } = loadTsModule("client/src/lib/rubberData.ts");
const { suggestSet, sideScore } = loadTsModule("client/src/utils/recommend.ts");
const { LEVEL_VALUES, BUDGET_VALUES, ROLE_VALUES } = loadTsModule(
  "client/src/types/favorites.ts"
);
const conditions = [];
const adoption = {};
const brands = new Set();
let tiedSides = 0;
for (const level of LEVEL_VALUES) {
  for (const budget of BUDGET_VALUES) {
    for (const foreRole of ROLE_VALUES) {
      for (const backRole of ROLE_VALUES) {
        const inputs = { level, budget, foreRole, backRole };
        const result = suggestSet(rubbers, inputs);
        if (result.status === "insufficient") {
          conditions.push({
            ...inputs,
            status: result.status,
            candidateCount: result.candidateCount,
          });
          continue;
        }
        const side = (rubber, list, role, alternatives) => {
          adoption[rubber.id] = (adoption[rubber.id] ?? 0) + 1;
          brands.add(rubber.brand);
          const score = sideScore(rubber, role, level);
          const topTieCount = list.filter(
            item => sideScore(item, role, level) === score
          ).length;
          if (topTieCount > 1) tiedSides++;
          return {
            id: rubber.id,
            score,
            topTieCount,
            candidateCount: list.length,
            alternatives: alternatives.map(item => item.id),
            topFour: list.slice(0, 4).map(item => item.id),
          };
        };
        conditions.push({
          ...inputs,
          status: "ready",
          fore: side(
            result.fore,
            result.foreList,
            foreRole,
            result.foreAlternatives ?? result.foreList.slice(1, 4)
          ),
          back: side(
            result.back,
            result.backList,
            backRole,
            result.backAlternatives ?? result.backList.slice(1, 4)
          ),
        });
      }
    }
  }
}
console.log(
  JSON.stringify(
    {
      summary: {
        conditions: conditions.length,
        insufficientConditions: conditions.filter(
          item => item.status === "insufficient"
        ).length,
        adoptedSides: Object.values(adoption).reduce((sum, n) => sum + n, 0),
        uniqueProducts: Object.keys(adoption).length,
        uniqueBrands: brands.size,
        tiedSides,
        adoption: Object.fromEntries(
          Object.entries(adoption).sort(([a], [b]) =>
            a < b ? -1 : a > b ? 1 : 0
          )
        ),
      },
      conditions,
    },
    null,
    2
  )
);
