import { config } from "dotenv";
config({ path: ".env.local" });

import { defineConfig } from "prisma/config";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL missing");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url },
});
