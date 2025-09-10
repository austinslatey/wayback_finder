#!/usr/bin/env node
import { readPartNumbers, writeResults } from "./src/csv.js";
import { fetchProductBySKU } from "./src/shopify.js";
import { fetchWaybackSnapshot } from "./src/wayback.js";

async function main() {
  const partNumbers = await readPartNumbers();
  console.log(`Found ${partNumbers.length} part numbers...`);

  const results = [];

  for (const sku of partNumbers) {
    console.log(`Processing SKU: ${sku}`);
    const product = await fetchProductBySKU(sku);

    if (!product) {
      results.push({ sku, shopifyUrl: "NOT FOUND", waybackUrl: "" });
      continue;
    }

    const waybackUrl = await fetchWaybackSnapshot(product.url);

    results.push({
      sku,
      shopifyUrl: product.url,
      waybackUrl: waybackUrl || "NO SNAPSHOT",
    });
  }

  await writeResults(results);
  console.log("Done! Results saved to wayback_results.csv");
}

main();
