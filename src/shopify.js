import fetch from "node-fetch";
import { SHOPIFY_DOMAIN, ADMIN_API_VERSION, ADMIN_TOKEN, STORE_FRONT_URL } from "./config.js";

export async function fetchProductBySKU(sku) {
  const query = `
    {
      products(first: 1, query: "sku:${sku}") {
        edges {
          node {
            handle
            title
          }
        }
      }
    }
  `;

  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_TOKEN,
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!res.ok) {
    console.error(`Shopify API error for SKU ${sku}: ${res.statusText}`);
    return null;
  }

  const data = await res.json();
  const product = data.data.products.edges[0]?.node;
  if (!product) return null;

  return {
    sku,
    handle: product.handle,
    url: `${STORE_FRONT_URL}/${product.handle}`,
  };
}
