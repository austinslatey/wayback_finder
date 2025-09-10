import dotenv from 'dotenv';
dotenv.config();

export const SHOPIFY_DOMAIN = "waldoch-truck-accessories-store.myshopify.com";
export const ADMIN_API_VERSION = "2025-01";
export const ADMIN_TOKEN = process.env.ADMIN_TOKEN
export const STORE_FRONT_URL = "https://store.waldoch.com/products";

// File paths
export const INPUT_FILE = "parts.csv";
export const OUTPUT_FILE = "wayback_results.csv";
