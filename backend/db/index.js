const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        clerk_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        plan VARCHAR(50) DEFAULT 'free',
        credits INTEGER DEFAULT 10,
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS usage_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        tool_name VARCHAR(100) NOT NULL,
        input_summary TEXT,
        credits_used INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
      CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
    `);
    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
  } finally {
    client.release();
  }
};

module.exports = { pool, initDB };
