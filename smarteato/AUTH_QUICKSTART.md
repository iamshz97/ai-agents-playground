# SmartEato Authentication - Quick Start

## ✅ What's Been Implemented

### Mobile App
- Landing screen with Login/Sign Up
- Authentication with Supabase (email/password)
- Profile setup form (name, age, weight, height, activity level, etc.)
- Dashboard with personalized greeting
- Navigation flow based on auth state

### Backend API
- JWT authentication with Supabase tokens
- Profile CRUD endpoints (`/api/profile`)
- Secure profile management
- Row-level security

## 🚀 Quick Setup (5 minutes)

### 1. Create Database Table

Go to your Supabase SQL Editor and run:
```bash
smarteato/src/SmartEato.Api/database-setup.sql
```

### 2. Get JWT Secret

1. Go to Supabase Project Settings → API → JWT Settings
2. Copy the **JWT Secret** (not the anon key!)
3. Add to `smarteato/src/SmartEato.Api/appsettings.json`:

```json
{
  "Supabase": {
    "Url": "https://uaqluphxbjznheqeseyk.supabase.co",
    "Key": "eyJhbGci...",
    "JwtSecret": "YOUR_JWT_SECRET_HERE"  ← Add this!
  }
}
```

### 3. Run the Apps

**Terminal 1 - Backend:**
```bash
cd smarteato/src/SmartEato.AppHost
dotnet run
```

**Terminal 2 - Mobile:**
```bash
cd smarteato/src/SmartEato.Mobile
npm start
```

Then press `a` for Android or `i` for iOS.

## 📱 Test the Flow

1. Tap "Sign Up" on landing screen
2. Create account: `test@example.com` / `password123`
3. Login with those credentials
4. Fill out profile setup form
5. See dashboard: "Hey {YourName}!"

## ⚠️ Important Notes

- **JWT Secret**: The most common issue is forgetting to add the JWT Secret to appsettings.json
- **Android Emulator**: The `.env` file is already configured with `10.0.2.2:5000`
- **iOS Simulator**: Change `.env` to `API_BASE_URL=http://localhost:5000`
- **Physical Device**: Use your computer's IP address

## 🔧 Troubleshooting

### "JWT Secret is not configured"
→ **Most common issue!** Add JWT Secret to `appsettings.json`:
- Go to Supabase → Settings → API → JWT Settings
- Copy the JWT Secret
- Add to `appsettings.json` under `Supabase:JwtSecret`
- Restart the API

### "401 Unauthorized" from API
→ JWT token validation failed. Check:
1. JWT Secret is correct in `appsettings.json`
2. JWT Secret matches your Supabase project
3. Mobile app is logged in (has valid session)
4. See `JWT_AUTHENTICATION_GUIDE.md` for detailed debugging

### "Failed to create profile"
→ Make sure you ran `database-setup.sql` in Supabase

### Mobile can't connect to API  
→ Check that API is running and the `API_BASE_URL` in `.env` is correct
- Android Emulator: `http://10.0.2.2:5000`
- iOS Simulator: `http://localhost:5000`
- Physical Device: `http://[your-ip]:5000`

### "Authentication failed"
→ JWT token validation is failing
- Verify JWT Secret matches your Supabase project exactly
- Check API logs for detailed error messages
- See `JWT_AUTHENTICATION_GUIDE.md` for step-by-step debugging

## 📚 Full Documentation

- **Setup Guide**: `AUTH_SETUP_GUIDE.md` - Detailed setup instructions
- **JWT Guide**: `JWT_AUTHENTICATION_GUIDE.md` - How JWT tokens work & troubleshooting
- **Implementation Summary**: `AUTH_IMPLEMENTATION_SUMMARY.md` - What was built and how it works
- **Database Schema**: `src/SmartEato.Api/database-setup.sql` - SQL for Supabase
- **Minimal API Architecture**: `MINIMAL_API_ARCHITECTURE.md` - Backend architecture explanation

## ✨ What's Next?

The auth system is ready! You can now:
- Add calorie tracking features
- Implement food logging
- Build AI agentic features
- Add more profile fields
- Enhance the UI with your design system

---

**Need help?** Check the full documentation or review the code comments.

