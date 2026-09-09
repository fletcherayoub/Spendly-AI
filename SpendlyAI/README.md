# Spendly AI - Mobile Finance & AI Receipt Scanner

"Snap. Track. Understand your spending."

Spendly AI is a modern personal finance Android/iOS mobile app built with Expo, React Native, TypeScript, and Supabase.

---

## 🚀 Key Features

1. **AI Receipt Scanning**: Capture receipts using Expo Camera and extract merchant, tax, total, and line items with server-side AI.
2. **Expense Management**: Track and categorize expenses manually or automatically from receipts.
3. **Monthly Budgeting**: Set spending targets and monitor live progress with automated budget warning alerts.
4. **Savings Goals**: Plan and visualize progress towards financial goals.
5. **AI Financial Intelligence**: Tailored spending analysis and cost-saving suggestions based on real user transaction history.
6. **Supabase Backend**: Relational Postgres database with Row Level Security (RLS) protection on all tables, plus encrypted Supabase Storage for private receipt images.

---

## 🛠 Project Architecture

```
src/
├── app/                  # Expo Router file-based navigation
│   ├── (auth)/          # Authentication flow (welcome, sign-in, sign-up)
│   ├── (tabs)/          # Main App Bottom Tabs (Home, Expenses, Statistics, Budget, Profile)
│   ├── scan/            # Camera receipt scanner & AI review pipeline
│   ├── expense/         # Manual expense creation & detail views
│   ├── goals/           # Savings goals manager
│   ├── ai/              # AI spending insights dashboard
│   └── settings/        # App preferences & settings
├── components/          # Reusable UI components (LoadingState, EmptyState, ErrorState)
├── hooks/               # Custom hooks (useAuth)
├── lib/                 # Supabase client setup
├── services/            # Data services & AI provider abstraction
├── store/               # Zustand store for app & ad state
├── theme/               # Centralized theme tokens (emerald palette, typography, spacing)
└── types/               # TypeScript database schema definitions

supabase/
├── functions/           # Supabase Edge Functions (process-receipt)
```

---

## 🔑 Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure your Supabase project credentials in `.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```

---

## 🏃 Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Expo dev server:
   ```bash
   npx expo start
   ```
3. Run on Android:
   ```bash
   npx expo start --android
   ```

---

## 🧪 Testing & Verification

- Check TypeScript types:
  ```bash
  npx tsc --noEmit
  ```
- Run Expo Doctor:
  ```bash
  npx expo-doctor
  ```
