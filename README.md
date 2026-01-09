# Discord Topic Reader

A web application that connects to Discord servers, allows you to select channels and threads, and generates AI-powered summaries of discussions using OpenAI.

## Features

- Connect to Discord servers via bot token
- Browse and select channels
- View and select threads within channels
- Generate AI summaries with:
  - Descriptive titles
  - Detailed summaries
  - Extracted keywords
  - Category classification
  - Attachment references
- Save summaries locally using IndexedDB (browser storage)
- **Optional**: Save summaries to Supabase database (cloud storage)
- View and manage saved summaries with filtering

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Discord Bot Token (from [Discord Developer Portal](https://discord.com/developers/applications))
- OpenAI API Key (from [OpenAI Platform](https://platform.openai.com/))

## Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
DISCORD_BOT_TOKEN=your_discord_bot_token_here
PORT=3000
FRONTEND_URL=http://localhost:4200

# Optional: Supabase Database (for cloud storage)
# See SUPABASE_SETUP.md for setup instructions
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Important**: Make sure your Discord bot has the following permissions:

- View Channels
- Read Message History
- Send Messages (if needed)

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Update `frontend/src/environments/environment.ts` and add your OpenAI API key:

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api",
  openaiApiKey: "your_openai_api_key_here",
};
```

## Running the Application

### Start the Backend

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3000`

### Start the Frontend

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:4200`

## Usage

1. Make sure both backend and frontend are running
2. Open your browser to `http://localhost:4200`
3. Select a channel from the dropdown
4. Select a thread from the list
5. Wait for the AI summary to be generated
6. Review and save the summary if desired
7. View saved summaries in the "Saved Summaries" tab

## Project Structure

```
DiscordTopicReader/
├── frontend/          # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # UI components
│   │   │   ├── services/      # Business logic services
│   │   │   └── models/        # TypeScript interfaces
│   │   └── environments/      # Environment configuration
│   └── package.json
├── backend/           # Express API server
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── services/  # Discord integration
│   │   └── server.ts  # Server entry point
│   └── package.json
└── README.md
```

## Technologies Used

- **Frontend**: Angular 17, TypeScript, ng-zorro-antd (Ant Design)
- **Backend**: Node.js, Express, Discord.js
- **Storage**: IndexedDB (via idb library)
- **AI**: OpenAI GPT-4 API

## Environment Variables

### Backend (.env)

- `DISCORD_BOT_TOKEN`: Your Discord bot token (required)
- `PORT`: Server port (default: 3000)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:4200)
- `SUPABASE_URL`: Your Supabase project URL (optional, for cloud storage)
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key (optional, for cloud storage)

### Frontend (environment.ts)

- `apiUrl`: Backend API URL
- `openaiApiKey`: Your OpenAI API key

## Security Notes

- Never commit your `.env` file or API keys to version control
- The Discord bot token is kept server-side for security
- OpenAI API key is stored in frontend environment (user's responsibility)
- CORS is configured to allow only the frontend origin

## Troubleshooting

### Backend won't start

- Check that `DISCORD_BOT_TOKEN` is set in `.env`
- Verify the bot token is valid
- Ensure the bot has proper permissions in your Discord server

### Frontend can't connect to backend

- Verify backend is running on port 3000
- Check CORS configuration in backend
- Verify `apiUrl` in frontend environment matches backend URL

### Summary generation fails

- Verify OpenAI API key is set in frontend environment
- Check that you have API credits/quota
- Review browser console for error messages

### Database storage (Supabase)

- See `SUPABASE_SETUP.md` for detailed setup instructions
- Summaries are saved locally by default (IndexedDB)
- Database storage is optional - app works without it
- If database is not configured, summaries are only saved locally

## License

MIT
