# Supabase Database Setup Guide

This guide will help you set up Supabase to store summaries in a database instead of just locally in the browser.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign up"
3. Sign up with GitHub, Google, or email
4. Create a new organization (if prompted)

## Step 2: Create a New Project

1. Click "New Project" in your Supabase dashboard
2. Fill in the project details:
   - **Name**: DiscordTopicReader (or any name you prefer)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Select "Free" tier
3. Click "Create new project"
4. Wait 2-3 minutes for the project to be provisioned

## Step 3: Get Your Supabase Credentials

1. In your project dashboard, click on the "Settings" icon (gear icon) in the left sidebar
2. Click on "API" in the settings menu
3. You'll see:
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon/public key**: Copy this (long string starting with `eyJ...`)

## Step 4: Create the Database Table

1. In your Supabase dashboard, click on "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy and paste the contents of `backend/supabase-migration.sql`
4. Click "Run" (or press Ctrl/Cmd + Enter)
5. You should see "Success. No rows returned"

## Step 5: Configure Row Level Security (RLS)

For development, we'll use a permissive policy that allows anonymous access. In production, you should set up proper authentication.

The migration script (`backend/supabase-migration.sql`) includes a permissive policy that allows all operations. **Important:** If you already created the table with a different policy, you may need to:

1. Go to "Authentication" > "Policies" in the left sidebar
2. Find the "summaries" table
3. Delete any existing policies
4. Run the updated migration script again, or manually create a policy named "Allow public access" with `USING (true)` and `WITH CHECK (true)` for all operations

The updated migration script will automatically drop old policies and create the correct one.

## Step 6: Update Backend Environment Variables

1. Create `backend/.env` file (copy from `.env.example` if it exists, or create a new file)
2. Add the following variables:

```env
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token_here

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:4200
```

Replace:

- `xxxxx` with your actual project subdomain (from Step 3)
- The `SUPABASE_ANON_KEY` with your actual anon key (from Step 3)
- `your_discord_bot_token_here` with your Discord bot token

## Step 7: Install Dependencies

In the `backend` directory, run:

```bash
npm install @supabase/supabase-js
```

## Step 8: Restart Your Backend Server

1. Stop your backend server (Ctrl+C)
2. Rebuild TypeScript: `npm run build`
3. Start the server: `npm run dev` or `npm start`

You should see:

```
✅ Database service initialized (Supabase)
✅ Summary API routes enabled
```

## Step 9: Test the Integration

1. Start your frontend: `cd frontend && npm start`
2. Generate a summary from a Discord thread
3. Click "Save Summary"
4. The summary should now be saved both:
   - **Locally** (in browser IndexedDB - for offline access)
   - **In Supabase** (in the cloud database)

## Verification

To verify summaries are being saved to Supabase:

1. Go to your Supabase dashboard
2. Click "Table Editor" in the left sidebar
3. Select the "summaries" table
4. You should see your saved summaries!

## Troubleshooting

### Backend shows "Database service not initialized"

- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in `backend/.env`
- Make sure there are no extra spaces or quotes around the values
- Restart the backend server after adding the variables

### "Failed to save summary" error

- Check that the `summaries` table exists in Supabase
- Verify Row Level Security policies allow INSERT operations
- Check browser console and backend logs for specific error messages

### "relation 'summaries' does not exist"

- Run the SQL migration script in Supabase SQL Editor
- Make sure the table was created successfully

## Free Tier Limits

Supabase Free Tier includes:

- **500 MB** database storage
- **2 GB** bandwidth per month
- **500 MB** file storage
- Unlimited API requests

For most use cases, this is more than enough!

## Next Steps

- Set up proper authentication if you want user-specific summaries
- Configure backups (available in paid tiers)
- Set up database backups
- Monitor usage in the Supabase dashboard
