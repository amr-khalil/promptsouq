import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { subscriptionPlans } from "./schema/subscription-plans";
import { creditTopupPacks } from "./schema/credit-topup-packs";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

async function main() {
  console.log("Seeding subscription plans...");

  await db
    .insert(subscriptionPlans)
    .values([
      {
        id: "standard",
        name: "Standard",
        nameAr: "أساسي",
        monthlyCredits: 50,
        monthlyPrice: 1000,
        sixMonthPrice: 6000,
        yearlyPrice: 12000,
        stripePriceIdMonthly: "price_standard_monthly_placeholder",
        stripePriceIdSixMonth: "price_standard_six_month_placeholder",
        stripePriceIdYearly: "price_standard_yearly_placeholder",
        features: [
          "50 رصيد شهرياً",
          "توليد نصوص",
          "توليد صور",
          "3 نماذج ذكاء اصطناعي",
        ],
        theme: "blue",
        icon: "Sword",
        sortOrder: 0,
      },
      {
        id: "pro",
        name: "Pro",
        nameAr: "احترافي",
        monthlyCredits: 150,
        monthlyPrice: 2000,
        sixMonthPrice: 12000,
        yearlyPrice: 24000,
        stripePriceIdMonthly: "price_pro_monthly_placeholder",
        stripePriceIdSixMonth: "price_pro_six_month_placeholder",
        stripePriceIdYearly: "price_pro_yearly_placeholder",
        features: [
          "150 رصيد شهرياً",
          "توليد نصوص",
          "توليد صور",
          "3 نماذج ذكاء اصطناعي",
          "أولوية الدعم",
        ],
        theme: "green",
        icon: "Zap",
        sortOrder: 1,
      },
      {
        id: "legendary",
        name: "Legendary",
        nameAr: "أسطوري",
        monthlyCredits: 500,
        monthlyPrice: 3000,
        sixMonthPrice: 18000,
        yearlyPrice: 36000,
        stripePriceIdMonthly: "price_legendary_monthly_placeholder",
        stripePriceIdSixMonth: "price_legendary_six_month_placeholder",
        stripePriceIdYearly: "price_legendary_yearly_placeholder",
        features: [
          "500 رصيد شهرياً",
          "توليد نصوص",
          "توليد صور",
          "3 نماذج ذكاء اصطناعي",
          "أولوية الدعم",
          "وصول مبكر للميزات",
        ],
        theme: "purple",
        icon: "Crown",
        sortOrder: 2,
      },
    ])
    .onConflictDoNothing();

  console.log("Subscription plans seeded successfully.");

  console.log("Seeding credit topup packs...");

  await db
    .insert(creditTopupPacks)
    .values([
      {
        id: "pack-10",
        credits: 10,
        price: 300,
        stripePriceId: "price_topup_10_placeholder",
        sortOrder: 0,
      },
      {
        id: "pack-50",
        credits: 50,
        price: 1200,
        stripePriceId: "price_topup_50_placeholder",
        sortOrder: 1,
      },
      {
        id: "pack-100",
        credits: 100,
        price: 2000,
        stripePriceId: "price_topup_100_placeholder",
        sortOrder: 2,
      },
    ])
    .onConflictDoNothing();

  console.log("Credit topup packs seeded successfully.");

  process.exit(0);
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
