import fs from "fs";
import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";
import { INPUT_FILE, OUTPUT_FILE } from "./config.js";

export function readPartNumbers() {
    return new Promise((resolve) => {
        const partNumbers = [];
        fs.createReadStream(INPUT_FILE)
            .pipe(
                csv({
                    mapHeaders: ({ header }) => header.trim(), // normalize headers
                })
            )
            .on("data", (row) => {
                if (row["Item Name/Number"]) {
                    partNumbers.push(row["Item Name/Number"].trim());
                }
            })
            .on("end", () => resolve(partNumbers));
    });
}

export async function writeResults(results) {
    const csvWriter = createObjectCsvWriter({
        path: OUTPUT_FILE,
        header: [
            { id: "sku", title: "SKU" },
            { id: "shopifyUrl", title: "Shopify URL" },
            { id: "waybackUrl", title: "Wayback Snapshot" },
        ],
    });

    await csvWriter.writeRecords(results);
}
