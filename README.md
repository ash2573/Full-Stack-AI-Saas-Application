# 🚀 QuickAI — Full-Stack AI SaaS

A complete AI-powered SaaS application with 6 AI tools, user authentication, and subscription payments.

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite) + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL via [Neon](https://neon.tech) |
| Auth | [Clerk](https://clerk.com) |
| Payments | [Stripe](https://stripe.com) |
| AI (Text) | OpenAI GPT-4o-mini + DALL-E 3 |
| AI (Image) | [Clipdrop API](https://clipdrop.co/apis) |

---

## 🤖 AI Tools

1. **Article Generator** — Title + word count → Full article (GPT-4o-mini)
2. **Blog Title Generator** — Keyword + category → 5 SEO titles
3. **Image Generator** — Text prompt → AI image (DALL-E 3)
4. **Background Remover** — Upload image → Transparent PNG (Clipdrop)
5. **Object Remover** — Image + description → Cleaned image (Clipdrop)
6. **Resume Analyzer** — PDF upload → Score + strengths/weaknesses (GPT-4o)

---

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- A [Neon](https://neon.tech) account (free tier works)
- A [Clerk](https://clerk.com) account (free tier works)
- A [Stripe](https://stripe.com) account
- An [OpenAI](https://platform.openai.com) API key
- A [Clipdrop](https://clipdrop.co/apis) API key

---

## ⚙️ Setup Instructions

### Step 1 — Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 2 — Configure Neon Database

1. Go to [neon.tech](https://neon.tech) and create a new project
2. Copy your connection string (it looks like `postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require`)
3. The database tables will be created automatically when you first start the server

---

### Step 3 — Configure Clerk

1. Go to [clerk.com](https://clerk.com) and create a new application
2. Enable **Email + Password** and/or **Google/GitHub** social login
3. Get your keys from **API Keys** in the Clerk dashboard:
   - `CLERK_SECRET_KEY` → for backend
   - `CLERK_PUBLISHABLE_KEY` → for frontend

4. Set up Clerk Webhook (to sync users to your DB):
   - Go to **Webhooks** → **Add Endpoint**
   - URL: `https://your-backend-domain.com/api/webhooks/clerk`
   - Select events: `user.created`, `user.updated`, `user.deleted`
   - Copy the **Signing Secret** → `CLERK_WEBHOOK_SECRET`

---

### Step 4 — Configure Stripe

1. Go to [stripe.com](https://stripe.com) dashboard
2. Create a **Product** with a **recurring price** (e.g., $19/month)
3. Copy the **Price ID** (starts with `price_`) → `STRIPE_PREMIUM_PRICE_ID`
4. Get your **Secret Key** → `STRIPE_SECRET_KEY`

5. Set up Stripe Webhook (for subscription events):
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe
   stripe login
   
   # Forward webhooks locally (for development)
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```
   - For production: Add endpoint in Stripe Dashboard → **Developers** → **Webhooks**
   - URL: `https://your-backend-domain.com/api/payments/webhook`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy **Signing Secret** → `STRIPE_WEBHOOK_SECRET`

6. Set up **Customer Portal** in Stripe Dashboard → **Settings** → **Billing** → **Customer Portal**

---

### Step 5 — Configure API Keys

**Backend `.env`** — Copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require

CLERK_SECRET_KEY=sk_test_xxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxx

OPENAI_API_KEY=sk-xxxxxxxxxx

CLIPDROP_API_KEY=xxxxxxxxxx

STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxx
STRIPE_PREMIUM_PRICE_ID=price_xxxxxxxxxx

FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`** — Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
VITE_API_URL=http://localhost:5000
```

---

### Step 6 — Run Locally

```bash
# Terminal 1 — Start backend
cd backend
npm run dev

# Terminal 2 — Start frontend
cd frontend
npm run dev

# Terminal 3 — Forward Stripe webhooks (optional, for payment testing)
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Visit `http://localhost:5173` 🎉

---

## 🌐 Deployment

### Backend (Railway / Render / Fly.io)

```bash
# Railway example
npm install -g @railway/cli
railway login
railway init
railway up
```

Set all environment variables in your hosting provider's dashboard.

### Frontend (Vercel)

```bash
npm install -g vercel
cd frontend
vercel
```

Set `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL` in Vercel environment variables.

Don't forget to update:
- `FRONTEND_URL` in backend `.env` to your Vercel deployment URL
- Clerk webhook URL to your production backend URL
- Stripe webhook URL to your production backend URL

---

## 📁 Project Structure

```
quickai/
├── backend/
│   ├── db/
│   │   └── index.js          # PostgreSQL connection + schema init
│   ├── middleware/
│   │   └── auth.js           # Clerk auth + credit system
│   ├── routes/
│   │   ├── aiTools.js        # Article, blog titles, image generation
│   │   ├── imageTools.js     # BG remover, object remover, resume analyzer
│   │   ├── user.js           # Credits, profile, history
│   │   ├── webhooks.js       # Clerk user sync webhook
│   │   └── payments.js       # Stripe checkout + webhooks
│   ├── server.js             # Express app entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   │   └── UserContext.jsx   # Global user/credits state
    │   ├── hooks/
    │   │   └── useApiCall.js     # Authenticated API calls
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── DashboardLayout.jsx
    │   │   ├── DashboardHome.jsx
    │   │   ├── PricingPage.jsx
    │   │   └── tools/
    │   │       ├── ArticleGenerator.jsx
    │   │       ├── BlogTitleGenerator.jsx
    │   │       ├── ImageGenerator.jsx
    │   │       ├── BackgroundRemover.jsx
    │   │       ├── ObjectRemover.jsx
    │   │       └── ResumeAnalyzer.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

---

## 🗃️ Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  plan VARCHAR(50) DEFAULT 'free',      -- 'free' or 'premium'
  credits INTEGER DEFAULT 10,            -- deducted on each tool use
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage logs
CREATE TABLE usage_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tool_name VARCHAR(100) NOT NULL,
  input_summary TEXT,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 💳 Subscription Model

| Feature | Free | Premium |
|---|---|---|
| Credits | 10/month | Unlimited |
| Tools | All 6 | All 6 |
| Price | $0 | $19/month |

- Each tool use = 1 credit
- Credits reset monthly (implement with a cron job if needed)
- Premium users bypass credit check entirely

---

## 🔒 API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/generate-article` | Generate article | ✅ |
| POST | `/api/generate-titles` | Generate blog titles | ✅ |
| POST | `/api/generate-image` | Generate AI image | ✅ |
| POST | `/api/remove-background` | Remove image background | ✅ |
| POST | `/api/remove-object` | Remove object from image | ✅ |
| POST | `/api/analyze-resume` | Analyze resume PDF | ✅ |
| GET | `/api/user/credits` | Get user data & credits | ✅ |
| GET | `/api/user/history` | Get usage history | ✅ |
| POST | `/api/payments/create-checkout` | Stripe checkout session | ✅ |
| POST | `/api/payments/create-portal` | Stripe billing portal | ✅ |
| POST | `/api/payments/webhook` | Stripe webhook handler | 🔐 |
| POST | `/api/webhooks/clerk` | Clerk user sync webhook | 🔐 |

---

## 🛠️ Customization Ideas

- Add credit reset cron job (monthly reset for free users)
- Add more AI tools (code generator, translator, etc.)
- Add team/organization plans
- Add usage analytics dashboard
- Add email notifications via Resend or SendGrid

---

## 📄 License

MIT — build whatever you want with this!
