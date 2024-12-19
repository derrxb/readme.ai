import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.server";

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL!,
// });

const db = drizzle({ connection: process.env.DATABASE_URL!, schema });

export { db };
