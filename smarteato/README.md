# SmartEato - AI-Powered Calorie Tracker

SmartEato is a full-stack TypeScript application for AI-powered calorie tracking, built with React Native (Expo), .NET 9, Supabase, and .NET Aspire for orchestration.

## 🏗️ Architecture

```
smarteato/
├── src/
│   ├── SmartEato.Mobile/          # React Native (Expo) TypeScript app
│   ├── SmartEato.Api/             # .NET 9 Web API with Supabase
│   ├── SmartEato.AppHost/         # .NET Aspire orchestration
│   └── SmartEato.ServiceDefaults/ # Shared Aspire service defaults
├── SmartEato.sln                  # Solution file
└── README.md
```

## 🛠️ Technology Stack

### Frontend (Mobile)
- **Framework**: React Native with Expo
- **Language**: TypeScript (strict mode)
- **State Management**: TanStack Query v5 for server state
- **HTTP Client**: Axios
- **Navigation**: React Navigation v6
- **Styling**: NativeWind (Tailwind CSS for React Native)

### Backend (API)
- **Framework**: .NET 9 Web API
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **ORM**: Supabase Client SDK
- **API Documentation**: Swagger/OpenAPI
- **Orchestration**: .NET Aspire

### Infrastructure
- **Orchestration**: .NET Aspire AppHost
- **Observability**: OpenTelemetry (Metrics, Tracing, Logging)
- **Health Checks**: ASP.NET Core Health Checks
- **Service Discovery**: Aspire Service Discovery

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **.NET 9 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/9.0)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Expo CLI** - Install with `npm install -g expo-cli`
- **Supabase Account** - [Sign up](https://supabase.com/)
- **Visual Studio 2022** or **VS Code** with C# extension
- **Android Studio** (for Android development) or **Xcode** (for iOS development on macOS)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd smarteato
```

### 2. Set Up Supabase

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Once created, navigate to Project Settings > API
3. Copy your:
   - Project URL
   - `anon` public API key

### 3. Configure the API

Edit `src/SmartEato.Api/appsettings.json`:

```json
{
  "Supabase": {
    "Url": "https://your-project.supabase.co",
    "Key": "your-anon-key-here"
  }
}
```

Or use User Secrets for development:

```bash
cd src/SmartEato.Api
dotnet user-secrets set "Supabase:Url" "https://your-project.supabase.co"
dotnet user-secrets set "Supabase:Key" "your-anon-key-here"
```

### 4. Configure the Mobile App

Create `src/SmartEato.Mobile/.env` file:

```env
# For Android Emulator
API_BASE_URL=http://10.0.2.2:5000

# For iOS Simulator
# API_BASE_URL=http://localhost:5000

# For Physical Device (replace with your computer's IP)
# API_BASE_URL=http://192.168.1.100:5000
```

### 5. Install Mobile Dependencies

```bash
cd src/SmartEato.Mobile
npm install
```

## 🏃 Running the Application

### Option 1: Run with .NET Aspire (Recommended)

This will orchestrate and run the API service with observability:

```bash
# From the smarteato root directory
cd src/SmartEato.AppHost
dotnet run
```

The Aspire dashboard will open in your browser showing:
- **Service Status**: Monitor API health
- **Logs**: View application logs
- **Traces**: Distributed tracing
- **Metrics**: Performance metrics

The API will be available at the URL shown in the Aspire dashboard (typically `http://localhost:5000` or similar).

### Option 2: Run Services Individually

**Start the API:**

```bash
cd src/SmartEato.Api
dotnet run
```

The API will be available at `https://localhost:7000` (or `http://localhost:5000`).

**Start the Mobile App:**

```bash
cd src/SmartEato.Mobile
npm start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator (macOS only)
- Press `w` for web browser
- Scan QR code with Expo Go app for physical device

## 📱 Mobile App Features

The mobile app is configured with:

- ✅ **TypeScript** with strict mode
- ✅ **TanStack Query** for efficient data fetching and caching
- ✅ **Axios** HTTP client with interceptors
- ✅ **React Navigation** ready for navigation
- ✅ **API Client** abstraction layer
- ✅ **Type-safe** API hooks
- ✅ **Environment variables** support
- ✅ **Error handling** with user-friendly messages

## 🔌 API Endpoints

### Available Endpoints

- `GET /api/info` - Get API information and status
- `GET /health` - Health check endpoint
- `GET /alive` - Liveness probe
- `GET /swagger` - Swagger UI (development only)

### Adding New Endpoints

1. Create a controller in `src/SmartEato.Api/Controllers/`
2. Add DTOs in `src/SmartEato.Api/Models/`
3. Create corresponding TypeScript types in `src/SmartEato.Mobile/src/types/`
4. Create TanStack Query hooks in `src/SmartEato.Mobile/src/api/hooks.ts`

## 🗄️ Database Setup (Supabase)

### Create Tables

Use Supabase SQL Editor to create tables:

```sql
-- Example: Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example: Food entries table
CREATE TABLE food_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein NUMERIC(10,2),
  carbs NUMERIC(10,2),
  fat NUMERIC(10,2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view their own food entries"
  ON food_entries FOR SELECT
  USING (auth.uid() = user_id);
```

## 🧪 Testing

### Test the API

```bash
# Using curl
curl http://localhost:5000/api/info

# Using httpie
http http://localhost:5000/api/info
```

### Test Mobile App Connection

The mobile app includes a test screen that automatically fetches API info on launch. If configured correctly, you should see:
- ✓ Connected
- API Name, Version, and Status

## 📦 Project Structure Details

### SmartEato.Mobile
```
src/SmartEato.Mobile/
├── src/
│   ├── api/
│   │   ├── client.ts          # Axios client with interceptors
│   │   └── hooks.ts           # TanStack Query hooks
│   ├── config/
│   │   └── api.config.ts      # API configuration
│   └── types/
│       └── api.types.ts       # TypeScript type definitions
├── App.tsx                     # Main app component
├── package.json
└── tsconfig.json
```

### SmartEato.Api
```
src/SmartEato.Api/
├── Program.cs                  # API configuration & startup
├── appsettings.json           # Configuration (Supabase, etc.)
└── SmartEato.Api.csproj
```

### SmartEato.ServiceDefaults
```
src/SmartEato.ServiceDefaults/
├── Extensions.cs              # Aspire service defaults
└── SmartEato.ServiceDefaults.csproj
```

### SmartEato.AppHost
```
src/SmartEato.AppHost/
├── AppHost.cs                 # Aspire orchestration
└── SmartEato.AppHost.csproj
```

## 🔧 Development Tips

### Hot Reload

- **Mobile**: Expo provides hot reload by default - changes are reflected immediately
- **API**: .NET hot reload is enabled - save files to see changes

### Debugging

**Mobile:**
- Use React Native Debugger
- Enable Developer Menu in Expo (shake device or Cmd+D/Ctrl+D)

**API:**
- Use Visual Studio debugger
- Or use VS Code with C# extension and launch.json

### CORS Issues

If you encounter CORS errors:
1. Ensure the mobile app's origin is in the CORS policy in `Program.cs`
2. Check that the API_BASE_URL in `.env` matches the API's URL

## 📚 Next Steps

1. **Authentication**: Implement Supabase Auth in both API and mobile app
2. **Database Models**: Create C# models and TypeScript types for your domain
3. **API Endpoints**: Add CRUD operations for food entries, user profiles, etc.
4. **Mobile UI**: Create screens for food logging, history, statistics
5. **AI Integration**: Add OpenAI or similar for food recognition and calorie estimation
6. **Push Notifications**: Set up notifications for reminders
7. **Offline Support**: Implement offline-first architecture with TanStack Query

## 🐛 Troubleshooting

### API not connecting from mobile

- **Android Emulator**: Use `http://10.0.2.2:5000` not `localhost`
- **iOS Simulator**: Use `http://localhost:5000`
- **Physical Device**: Use your computer's IP address (e.g., `http://192.168.1.100:5000`)
- Ensure Windows Firewall allows incoming connections on port 5000

### Supabase connection errors

- Verify your Supabase URL and API key are correct
- Check Supabase project status in dashboard
- Ensure your Supabase project is active (not paused)

### Build errors

- Clear caches: `dotnet clean` and `npm cache clean --force`
- Restore packages: `dotnet restore` and `npm install`
- Delete `bin`, `obj`, `node_modules` folders and reinstall

## 📄 License

[Your License Here]

## 🤝 Contributing

[Your Contributing Guidelines Here]

## 📧 Contact

[Your Contact Information]

---

**Built with ❤️ using .NET 9, React Native, Supabase, and .NET Aspire**

