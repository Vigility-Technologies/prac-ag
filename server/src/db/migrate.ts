import { supabase } from "../config/supabase";
import fs from "fs";
import path from "path";

async function migrate() {
  try {
    console.log("Running database migrations...");

    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Execute the schema
    const { error } = await supabase.rpc("exec_sql", { sql: schema });

    if (error) {
      console.error("Migration error:", error);
      process.exit(1);
    }

    console.log("✅ Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
