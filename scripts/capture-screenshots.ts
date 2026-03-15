import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = path.resolve(__dirname, "../docs/screenshots");
const VIEWPORT = { width: 1280, height: 720 };

interface PageConfig {
  name: string;
  path: string;
  waitFor?: string;
}

const PAGES: PageConfig[] = [
  { name: "homepage", path: "/" },
  { name: "marketplace", path: "/market" },
  { name: "search", path: "/search?q=prompt" },
  { name: "cart", path: "/cart" },
  { name: "sign-in", path: "/sign-in" },
  { name: "subscription", path: "/subscription" },
  { name: "ranking", path: "/ranking" },
  { name: "gallery", path: "/gallery" },
];

async function checkDevServer(): Promise<boolean> {
  try {
    const response = await fetch(BASE_URL);
    return response.ok || response.status === 307 || response.status === 308;
  } catch {
    return false;
  }
}

async function findDynamicPages(
  page: Awaited<ReturnType<Awaited<ReturnType<typeof chromium.launch>>["newPage"]>>
): Promise<PageConfig[]> {
  const dynamicPages: PageConfig[] = [];

  // Find a valid prompt ID from the marketplace page
  try {
    await page.goto(`${BASE_URL}/market`, { waitUntil: "networkidle" });
    const promptLink = await page.$('a[href*="/prompt/"]');
    if (promptLink) {
      const href = await promptLink.getAttribute("href");
      if (href) {
        dynamicPages.push({ name: "prompt-detail", path: href });
      }
    }
  } catch {
    console.warn("  Could not find a prompt detail link on marketplace page");
  }

  // Find a valid seller ID from ranking, marketplace, or prompt detail pages
  try {
    const pagesToSearch = [`${BASE_URL}/ranking`, `${BASE_URL}/market`];
    let sellerFound = false;
    for (const searchUrl of pagesToSearch) {
      if (sellerFound) break;
      await page.goto(searchUrl, { waitUntil: "networkidle" });
      const sellerLink = await page.$('a[href*="/seller/"]');
      if (sellerLink) {
        const href = await sellerLink.getAttribute("href");
        if (href) {
          dynamicPages.push({ name: "seller-storefront", path: href });
          sellerFound = true;
        }
      }
    }
    if (!sellerFound) {
      // Fallback: use seed seller ID
      dynamicPages.push({ name: "seller-storefront", path: "/seller/seed-seller-1" });
    }
  } catch {
    console.warn("  Could not find a seller storefront link, using fallback");
    dynamicPages.push({ name: "seller-storefront", path: "/seller/seed-seller-1" });
  }

  return dynamicPages;
}

async function main() {
  console.log("Screenshot Capture Script");
  console.log("========================\n");

  // Check dev server
  const serverRunning = await checkDevServer();
  if (!serverRunning) {
    console.error(
      "Error: Dev server is not running at " + BASE_URL + "\n" +
      "Start it first with: npm run dev"
    );
    process.exit(1);
  }
  console.log("Dev server detected at " + BASE_URL + "\n");

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Launch browser
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    colorScheme: "light",
    locale: "en",
  });
  const page = await context.newPage();

  // Find dynamic pages (prompt detail, seller storefront)
  console.log("Discovering dynamic page URLs...");
  const dynamicPages = await findDynamicPages(page);
  const allPages = [...PAGES, ...dynamicPages];

  console.log(`Found ${allPages.length} pages to capture\n`);

  let captured = 0;
  let failed = 0;
  const results: { name: string; status: string }[] = [];

  for (const pageConfig of allPages) {
    const outputPath = path.join(OUTPUT_DIR, `${pageConfig.name}.png`);
    try {
      console.log(`Capturing: ${pageConfig.name} (${pageConfig.path})`);
      await page.goto(`${BASE_URL}${pageConfig.path}`, {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      // Wait a bit for any animations to settle
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: outputPath,
        fullPage: false,
      });

      captured++;
      results.push({ name: pageConfig.name, status: "OK" });
      console.log(`  Saved: ${outputPath}`);
    } catch (e) {
      failed++;
      const errorMsg = e instanceof Error ? e.message : String(e);
      results.push({ name: pageConfig.name, status: `FAILED: ${errorMsg}` });
      console.error(`  Failed: ${pageConfig.name} - ${errorMsg}`);
    }
  }

  await browser.close();

  // Print summary
  console.log("\n========================");
  console.log("Summary");
  console.log("========================");
  console.log(`Total:    ${allPages.length}`);
  console.log(`Captured: ${captured}`);
  console.log(`Failed:   ${failed}`);
  console.log("");

  for (const r of results) {
    const icon = r.status === "OK" ? "✓" : "✗";
    console.log(`  ${icon} ${r.name}: ${r.status}`);
  }

  if (failed > 0) {
    console.log("\nSome screenshots failed. Check errors above.");
    process.exit(1);
  }

  console.log("\nAll screenshots captured successfully!");
}

main();
