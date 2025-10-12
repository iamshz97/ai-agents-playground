# SmartEato Authentication & Profile Setup Guide

This guide walks you through setting up the authentication and user profile system for SmartEato.

## Prerequisites

- Supabase project created at [supabase.com](https://supabase.com)
- .NET 9.0 SDK installed
- Node.js and npm installed
- Expo CLI installed

## Step 1: Supabase Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script located at `src/SmartEato.Api/database-setup.sql`
4. Verify the `user_profiles` table was created successfully

## Step 2: Get Supabase Credentials

### For Mobile App (Anonymous Key)

1. Go to Project Settings > API in Supabase
2. Copy the following values:
   - **Project URL**: `https://[your-project].supabase.co`
   - **Anon/Public Key**: `eyJhbGci...` (starts with eyJ)

### For Backend API (Service Role Key & JWT Secret)

1. Copy the **Service Role Key** (keep this secret!)
2. Go to Project Settings > API > JWT Settings
3. Copy the **JWT Secret** (this is used to validate tokens)

## Step 3: Configure Mobile App

1. Navigate to `src/SmartEato.Mobile/`
2. Update the `.env` file:

```env
# API Configuration
API_BASE_URL=http://10.0.2.2:5000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

**Note:** For different platforms:
- Android Emulator: `http://10.0.2.2:5000`
- iOS Simulator: `http://localhost:5000`
- Physical Device: `http://[your-computer-ip]:5000`

## Step 4: Configure Backend API

1. Navigate to `src/SmartEato.Api/`
2. Update `appsettings.json` or `appsettings.Development.json`:

```json
{
  "Supabase": {
    "Url": "https://your-project.supabase.co",
    "Key": "your_service_role_key_here",
    "JwtSecret": "your_jwt_secret_here"
  }
}
```

**⚠️ Important:** 
- Never commit the service role key to version control
- Use User Secrets or environment variables for production
- The JWT Secret is needed to validate user tokens from Supabase

## Step 5: Install Dependencies

### Mobile App

```bash
cd src/SmartEato.Mobile
npm install
```

### Backend API

```bash
cd src/SmartEato.Api
dotnet restore
```

## Step 6: Run the Application

### Start the Backend API

```bash
cd src/SmartEato.AppHost
dotnet run
```

Or from the SmartEato root directory:
```bash
.\run-aspire.ps1
```

The API will be available at `http://localhost:5000` (or the port shown in Aspire dashboard)

### Start the Mobile App

```bash
cd src/SmartEato.Mobile
npm start
```

Then:
- Press `a` for Android
- Press `i` for iOS
- Scan QR code with Expo Go app

## Authentication Flow

1. **Landing Screen** → User sees Login/Sign Up options
2. **Sign Up** → User creates account with email/password
3. **Email Confirmation** → Supabase sends confirmation email (optional, can be disabled)
4. **Login** → User logs in with credentials
5. **Profile Check** → App checks if profile exists in Supabase
6. **Profile Setup** → If no profile, show profile setup form
7. **Submit Profile** → POST to `/api/profile` endpoint (authenticated with JWT)
8. **Dashboard** → Show personalized dashboard with "Hey {firstName}!"

## Testing the Flow

1. Open the mobile app
2. Click "Sign Up" on landing screen
3. Create an account with email/password
4. Login with the credentials
5. Fill out the profile setup form
6. Submit and verify you see the dashboard with your name

## Troubleshooting

### "JWT Secret is not configured"
- Make sure you've added the JWT Secret to `appsettings.json`
- Restart the API after updating configuration

### "Failed to create profile"
- Check that database-setup.sql has been run
- Verify the service role key is correct
- Check API logs for detailed error messages

### "Authentication failed"
- Verify the JWT Secret matches your Supabase project
- Check that the token is being sent in Authorization header
- Look for authentication errors in API logs

### Mobile app can't connect to API
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical device, use your computer's IP address
- Make sure API is running and accessible
- Check firewall settings

## API Endpoints

### POST /api/profile
Create user profile (requires authentication)

```json
{
  "fullName": "John Doe",
  "birthdate": "1990-01-01",
  "gender": "Male",
  "currentWeight": 75.5,
  "height": 175,
  "goalWeight": 70,
  "activityLevel": "Active",
  "dietaryPreferences": ["Vegetarian"]
}
```

### PUT /api/profile
Update user profile (requires authentication)

```json
{
  "currentWeight": 74.5,
  "goalWeight": 69
}
```

### GET /api/profile
Get user profile (requires authentication)

Returns the user's profile data.

## Security Notes

1. **Service Role Key**: Keep this secret! Never expose it in client-side code
2. **Anon Key**: Safe to use in mobile app, has limited permissions
3. **JWT Secret**: Used by backend to validate tokens, keep it secret
4. **Row Level Security**: Enabled on user_profiles table to prevent unauthorized access
5. **HTTPS**: Always use HTTPS in production

## Next Steps

After setting up authentication:
1. Add password reset functionality
2. Implement social OAuth providers (Google, Apple)
3. Add profile picture upload
4. Create additional profile fields as needed
5. Implement calorie tracking features

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT Authentication in .NET](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

