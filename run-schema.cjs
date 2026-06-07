const { Client } = require("pg")
const fs = require("fs")
const path = require("path")

const client = new Client({
  connectionString: "postgresql://postgres.uwkvkfnxzhlgsigvceky:TB Pro 12345678@aws-0-us-east-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false },
})

async function run() {
  try {
    await client.connect()
    console.log("Connected to Supabase DB")

    const schemaSql = fs.readFileSync(path.resolve(__dirname + "/supabase-schema.sql"), "utf-8")
    console.log("Executing schema...")
    await client.query(schemaSql)
    console.log("Schema executed successfully")

    const seedSql = fs.readFileSync(path.resolve(__dirname + "/seed.sql"), "utf-8")
    console.log("Executing seed data...")
    await client.query(seedSql)
    console.log("Seed data inserted successfully")

    await client.end()
    console.log("All done!")
  } catch (err) {
    console.error("Error:", err.message)
    process.exit(1)
  }
}

run()
