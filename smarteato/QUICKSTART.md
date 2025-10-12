# SmartEato Quick Start Guide

Get up and running with SmartEato in 5 minutes!

## Prerequisites Check

Before starting, make sure you have:
- [ ] .NET 9 SDK installed (`dotnet --version` should show 9.x)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Supabase account created

## Step 1: Configure Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for project to be ready (~2 minutes)
3. Go to **Project Settings** → **API**
4. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key

## Step 2: Configure API (1 minute)

Edit `src/SmartEato.Api/appsettings.json`:

```json
{
  "Supabase": {
    "Url": "YOUR_PROJECT_URL_HERE",
    "Key": "YOUR_ANON_KEY_HERE"
  }
}
```

**OR** use User Secrets (recommended):

```bash
cd src/SmartEato.Api
dotnet user-secrets set "Supabase:Url" "YOUR_PROJECT_URL"
dotnet user-secrets set "Supabase:Key" "YOUR_ANON_KEY"
cd ../..
```

## Step 3: Run Everything with Aspire (1 minute)

🎉 **Both the API and Mobile App will start together!**

### Option A: Using PowerShell Script (Windows)

```powershell
.\run-aspire.ps1
```

### Option B: Manual

```bash
cd src/SmartEato.AppHost
dotnet run
```

✅ The Aspire Dashboard will open in your browser
✅ You'll see TWO services running:
   - **smarteato-api** - The backend API
   - **smarteato-mobile** - The React Native app (Expo)

## Step 4: Access the Mobile App (30 seconds)

The mobile app is already running! To access it:

1. **In the Aspire Dashboard**, find the **smarteato-mobile** service
2. **Click on its endpoint** (usually `http://localhost:8081`)
3. **Or open your browser** to `http://localhost:8081`

You'll see the Expo interface. Then:
- Press **`a`** for Android emulator
- Press **`i`** for iOS simulator (macOS only)
- Press **`w`** for web browser
- Scan QR code with **Expo Go** app for physical device

> **Note**: If you prefer to run the mobile app separately (not with Aspire):
> ```powershell
> .\run-mobile.ps1
> ```

## Step 5: Verify Connection

1. The mobile app should show "API Status"
2. If it shows **"✓ Connected"**, you're all set!
3. If you see an error, check the troubleshooting section below

## Troubleshooting

### Mobile app can't connect to API

**Problem**: Shows "Error: Network Error" or timeout

**Solutions**:

1. **Check API is running**: Look at Aspire Dashboard to confirm API is up
2. **Check API URL**: 
   - Android Emulator: Create `.env` file with `API_BASE_URL=http://10.0.2.2:5000`
   - iOS Simulator: Use `API_BASE_URL=http://localhost:5000`
   - Physical Device: Use your computer's IP (e.g., `http://192.168.1.100:5000`)
3. **Firewall**: Allow incoming connections on port 5000
4. **Restart**: Stop and restart both API and mobile app

### Supabase connection error

**Problem**: API shows Supabase errors in logs

**Solutions**:
1. Verify Supabase URL and Key are correct
2. Check your Supabase project is active (not paused)
3. Test connection: `curl https://YOUR_PROJECT.supabase.co/rest/v1/`

### Build errors

```bash
# Clean and rebuild
cd src/SmartEato.AppHost
dotnet clean
dotnet build

# Mobile
cd ../SmartEato.Mobile
rm -rf node_modules
npm install
```

## What's Next?

Now that everything is running:

1. **Explore the API**: Open the Aspire Dashboard and check out the Swagger UI
2. **Check the code**: 
   - API: `src/SmartEato.Api/Program.cs`
   - Mobile: `src/SmartEato.Mobile/App.tsx`
3. **Read the full README**: `README.md` for detailed documentation
4. **Start building**: Add your first endpoint and screen!

## Useful Commands

```bash
# Build solution
dotnet build SmartEato.sln

# Run only the API (without Aspire)
cd src/SmartEato.Api && dotnet run

# Run mobile with specific platform
npm start -- --android
npm start -- --ios
npm start -- --web

# Clear mobile cache
npm start -- --clear
```

## Development Workflow

1. **Start Aspire**: `.\run-aspire.ps1` (keeps running)
2. **Start Mobile**: `.\run-mobile.ps1` (in new terminal, keeps running)
3. **Make changes**: Edit code, both will hot reload
4. **View logs**: Check Aspire Dashboard for API logs
5. **Debug mobile**: Use React Native Debugger or browser console

---

**Need help?** Check the full README.md or create an issue on GitHub.

