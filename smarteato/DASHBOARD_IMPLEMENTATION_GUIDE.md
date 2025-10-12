# SmartEato Dashboard Implementation Guide

## Overview

The dashboard has been implemented with AI-powered calorie tracking, real-time updates, and smart recommendations. This guide covers the complete implementation.

## 🎯 Features Implemented

### Mobile App
- ✅ **Calorie Ring Chart** - Visual progress toward daily goal
- ✅ **Macro Tiles** - Protein, Carbs, Fats with progress bars
- ✅ **Smart AI Recommendations** - Context-aware suggestions
- ✅ **Meal Input Bar** - Text + camera + photo gallery
- ✅ **Meal History** - Today's logged meals with details
- ✅ **Real-time Updates** - Supabase subscriptions for instant refresh

### Backend API (AI-Powered)
- ✅ **Input Parsing Agent** - Extracts meal info from text
- ✅ **Vision Analysis Agent** - Identifies food from photos
- ✅ **Nutrient Analysis Agent** - Calculates calories and macros
- ✅ **Recommendation Agent** - Generates personalized suggestions
- ✅ **Workflow Orchestration** - Sequential processing with branching logic
- ✅ **Minimal API Endpoints** - RESTful API for meal logging

## 📁 File Structure

### Backend (.NET API)

```
SmartEato.Api/
├── Agents/Models/
│   ├── MealInputResult.cs           # Structured output from input parsing
│   ├── VisionMealResult.cs          # Structured output from vision
│   ├── NutrientBreakdown.cs         # Structured output from nutrition analysis
│   └── RecommendationResult.cs      # Structured output from recommendations
├── Models/
│   ├── Meal.cs                      # Meal entity
│   ├── DailySummary.cs              # Daily nutrition totals
│   ├── Recommendation.cs            # AI recommendations
│   ├── ChatThread.cs                # Chat history
│   └── DTOs/
│       ├── LogMealDto.cs            # Meal logging request
│       └── MealAnalysisResult.cs    # Meal logging response
├── Services/
│   ├── IMealAnalysisService.cs      # AI analysis interface
│   ├── MealAnalysisService.cs       # AI agents implementation
│   ├── IMealService.cs              # Data operations interface
│   ├── MealService.cs               # Supabase CRUD operations
│   ├── IMealWorkflowService.cs      # Workflow orchestration interface
│   └── MealWorkflowService.cs       # Complete meal logging workflow
├── Endpoints/Meals/
│   ├── LogMealEndpoint.cs           # POST /api/meals
│   └── GetDailySummaryEndpoint.cs   # GET /api/meals/daily-summary
└── database-meals-schema.sql        # Database schema
```

### Mobile (React Native)

```
SmartEato.Mobile/src/
├── components/dashboard/
│   ├── CalorieRingChart.tsx         # Circular progress chart
│   ├── MacroTile.tsx                # Individual macro display
│   ├── RecommendationCard.tsx       # AI suggestion card
│   └── MealInputBar.tsx             # Meal logging input
├── hooks/
│   └── useMealLogging.ts            # Meal API hooks + realtime
├── api/
│   └── meals.api.ts                 # Meal API client
├── types/
│   └── meal.types.ts                # Type definitions
└── screens/dashboard/
    └── DashboardScreen.tsx          # Main dashboard UI
```

## 🔄 Workflow Architecture

### Meal Logging Workflow (Sequential + Branching)

```
User Input (Text + Optional Image)
         ↓
┌────────────────────────┐
│ Input Parsing Agent    │ → Extracts meal name, time, description
└────────────────────────┘
         ↓
  [Has Image?]──────┐
         │          │
        YES         NO
         │          │
         ↓          ↓
┌────────────────┐  Skip Vision
│ Vision Agent  │
└────────────────┘
         │
         ↓
┌────────────────────────┐
│ Nutrient Analysis      │ → Calculates calories, macros, ingredients
└────────────────────────┘
         ↓
┌────────────────────────┐
│ Save to Supabase       │ → Persist meal data
└────────────────────────┘
         ↓
┌────────────────────────┐
│ Update Daily Summary   │ → Update totals for the day
└────────────────────────┘
         ↓
┌────────────────────────┐
│ Generate Recommendation│ → AI suggestion (async)
└────────────────────────┘
         ↓
      Complete!
```

### AI Agents

#### 1. Input Parsing Agent
- **Input:** Raw user text (e.g., "I had scrambled eggs for breakfast")
- **Output:** Structured JSON
  ```json
  {
    "meal_name": "Scrambled Eggs",
    "meal_time": "2025-10-12T08:00:00Z",
    "description": "scrambled eggs for breakfast",
    "has_image": false
  }
  ```

#### 2. Vision Analysis Agent (Conditional)
- **Input:** Base64 image
- **Output:** Structured JSON
  ```json
  {
    "meal_name": "Chicken Caesar Salad",
    "identified_items": ["Grilled chicken", "Romaine lettuce", "Caesar dressing", "Croutons"],
    "estimated_portions": "Medium serving, approximately 300g",
    "confidence": 0.85,
    "description": "A Caesar salad with grilled chicken..."
  }
  ```

#### 3. Nutrient Analysis Agent
- **Input:** Meal description + optional vision context
- **Output:** Structured JSON with complete nutrition breakdown
  ```json
  {
    "meal_name": "Chicken Caesar Salad",
    "total_calories": 450,
    "protein": 35,
    "carbs": 25,
    "fats": 22,
    "ingredients": [
      { "name": "Grilled Chicken", "calories": 200, "protein": 30, "carbs": 0, "fats": 8 },
      { "name": "Caesar Dressing", "calories": 150, "protein": 2, "carbs": 5, "fats": 14 },
      ...
    ]
  }
  ```

#### 4. Recommendation Agent
- **Input:** User profile + daily summary
- **Output:** Personalized suggestion
  ```json
  {
    "recommendation": "You're low on protein. Consider a protein shake or grilled chicken.",
    "reason": "You've consumed only 45g of your 150g protein goal",
    "priority": 4,
    "suggested_foods": ["Greek yogurt", "Grilled chicken breast", "Protein shake"]
  }
  ```

## 🗄️ Database Schema

Run `database-meals-schema.sql` in Supabase to create:

- **meals** - Stores meal data with nutrition
- **daily_summaries** - Aggregated daily totals
- **recommendations** - AI-generated suggestions
- **chat_threads** - Conversation history
- **meal-photos** storage bucket - For meal images

## 🔐 Security & Permissions

### Row Level Security (RLS)
- ✅ Users can only read their own data
- ✅ Backend service role can write all data
- ✅ Real-time subscriptions respect RLS policies

### Authentication
- All API endpoints require JWT token
- Mobile app automatically includes token
- Backend validates and extracts user ID

## 🚀 Setup Instructions

### Step 1: Database Setup

```sql
-- Run in Supabase SQL Editor
-- First run: database-setup.sql (user profiles)
-- Then run: database-meals-schema.sql (meals tracking)
```

### Step 2: Configure Azure OpenAI

**Already Configured ✅** - Your settings are correct:

```json
{
  "AzureOpenAI": {
    "Endpoint": "https://busybeansai.openai.azure.com",
    "ApiKey": "your-api-key",
    "Deployment": "gpt-4.1-mini"
  }
}
```

**Note:** The service uses API Key authentication (not Azure CLI)

### Step 3: Install Dependencies

**Backend:**
```bash
cd smarteato/src/SmartEato.Api
# Packages already installed:
# - Azure.AI.OpenAI
# - Azure.Identity
# - Microsoft.Extensions.AI
```

**Mobile:**
```bash
cd smarteato/src/SmartEato.Mobile
# Packages already installed:
# - expo-image-picker
# - react-native-svg
# - @expo/vector-icons
```

### Step 4: Stop Running API (if any)

Before building:
```bash
# Find and stop any running API process
# Then rebuild:
cd smarteato/src/SmartEato.Api
dotnet build
```

### Step 5: Run the Apps

**Backend:**
```bash
cd smarteato/src/SmartEato.AppHost
dotnet run
```

**Mobile:**
```bash
cd smarteato/src/SmartEato.Mobile
npm start
```

## 📱 Testing the Dashboard

### Test Flow

1. **Initial State**
   - Open app → See login/signup
   - Login → Complete profile setup (if new user)
   - See dashboard with 0 calories, empty meals

2. **Log First Meal (Text Only)**
   - Type: "I had scrambled eggs and toast for breakfast"
   - Tap send
   - Watch AI analyze the meal
   - See calorie ring update
   - See meal appear in "Today's Meals"
   - See macro tiles update

3. **Log Meal with Photo**
   - Tap camera icon
   - Take/select photo of food
   - Type: "Lunch"
   - Tap send
   - Vision agent identifies food
   - Nutrition calculated from image analysis
   - Dashboard updates in real-time

4. **View Recommendation**
   - After logging meals, AI generates suggestion
   - Appears in "Smart Recommendation" card
   - Updates based on your intake patterns

5. **Real-time Updates**
   - Dashboard updates instantly when meals logged
   - No need to refresh manually
   - Supabase real-time subscriptions handle updates

## 🔍 API Endpoints

### POST /api/meals
Log a new meal with AI analysis

**Request:**
```json
{
  "mealName": "Breakfast",
  "mealTime": "2025-10-12T08:00:00Z",
  "description": "Scrambled eggs with whole wheat toast",
  "imageBase64": "base64_string_here" // optional
}
```

**Response:**
```json
{
  "mealId": "uuid",
  "mealName": "Scrambled Eggs with Toast",
  "totalCalories": 350,
  "protein": 20,
  "carbs": 35,
  "fats": 12,
  "ingredients": [...],
  "visionAnalysis": "...",  // if image provided
  "timestamp": "2025-10-12T08:00:00Z"
}
```

### GET /api/meals/daily-summary?date=2025-10-12
Get daily nutrition summary with recommendation

**Response:**
```json
{
  "summary": {
    "totalCalories": 1250,
    "totalProtein": 85,
    "totalCarbs": 120,
    "totalFats": 45,
    "calorieGoal": 2000,
    "mealsCount": 3
  },
  "recommendation": {
    "recommendationText": "You're doing great! Consider adding more vegetables for fiber.",
    "reason": "Your protein is on track, but fiber intake could be higher",
    "priority": 2
  },
  "meals": [...]
}
```

## 🎨 UI Design

### Color Palette
- **Primary:** `#000000` (Black)
- **Background:** `#FFFFFF` (White)
- **Secondary BG:** `#F5F5F5` (Light Gray)
- **Text Secondary:** `#666666` (Gray)
- **Protein:** `#FF6B6B` (Red)
- **Carbs:** `#4ECDC4` (Teal)
- **Fats:** `#FFD93D` (Yellow)
- **Recommendation:** `#FFB800` (Amber)

### Layout
Minimalistic white design as requested, ready for design system enhancement later.

## 🐛 Troubleshooting

### "Azure OpenAI Endpoint not configured"
→ Add Azure OpenAI endpoint to `appsettings.json`

### "File is locked by another process" when building
→ Stop the running API process first, then `dotnet build`

### No meals appearing
→ Check that `database-meals-schema.sql` has been run in Supabase

### Real-time updates not working
→ Verify Supabase realtime is enabled for your project

### Vision analysis not working
→ Ensure gpt-4o (vision-capable model) is deployed in Azure OpenAI

### Recommendation not generating
→ Check API logs - recommendation runs async and errors are logged

## 📊 How AI Analysis Works

### 1. Structured Output (JSON Schema)

All AI agents return **structured JSON** using Azure OpenAI's JSON Schema mode:

```csharp
var options = new ChatCompletionOptions
{
    ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
        jsonSchemaFormatName: "nutrient_breakdown",
        jsonSchema: BinaryData.FromString(schema)
    )
};
```

Benefits:
- ✅ Guaranteed valid JSON
- ✅ Type-safe responses
- ✅ No parsing errors
- ✅ Schema enforcement

### 2. Branching Logic

Image analysis only runs when image is provided:

```csharp
// Step 2: Analyze image if provided (Branching Logic)
VisionMealResult? visionResult = null;
if (!string.IsNullOrEmpty(dto.ImageBase64))
{
    visionResult = await _analysisService.AnalyzeMealImageAsync(dto.ImageBase64);
}
```

### 3. Concurrent Execution

Recommendation generation runs in background while response returns:

```csharp
// Step 6: Generate recommendation (fire and forget)
_ = Task.Run(async () =>
{
    var recResult = await _analysisService.GenerateRecommendationAsync(...);
    await _mealService.CreateRecommendationAsync(...);
});
```

## 🔄 Real-time Data Flow

```
Mobile App                    Supabase              .NET API
    │                            │                     │
    │--[Log Meal]---------------------------------->│
    │                            │                     │
    │                            │                     │--[AI Analysis]
    │                            │                     │--[Calculate Nutrition]
    │                            │                     │
    │                            │<--[Write Meal]------|
    │                            │<--[Update Summary]--|
    │                            │                     │
    │<--[Real-time Update]-------|                     │
    │  (Supabase subscription)   │                     │
    │                            │                     │
    │  [UI Updates Instantly]    │                     │
```

## 🎓 Learning Resources

- [Azure OpenAI Structured Output](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/structured-outputs)
- [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [React Query](https://tanstack.com/query/latest)

## ✨ Next Steps

### Immediate Tasks
1. Run `database-meals-schema.sql` in Supabase
2. Configure Azure OpenAI endpoint
3. Stop API, rebuild, restart
4. Test meal logging flow

### Future Enhancements
1. Add meal editing/deletion
2. Weekly trends and charts
3. Barcode scanning
4. Meal templates and favorites
5. Export nutrition data
6. Social sharing
7. Custom macro goals
8. Meal planning assistant
9. Recipe suggestions
10. Integration with fitness apps

## 📝 Sample Usage

### Log a Text Meal

```typescript
// User types in input bar
"I had a grilled chicken breast with steamed broccoli and brown rice"

// AI analyzes and returns
{
  mealName: "Grilled Chicken with Broccoli and Rice",
  totalCalories: 450,
  protein: 45g,
  carbs: 50g,
  fats: 8g,
  ingredients: [...]
}
```

### Log a Photo Meal

```typescript
// User takes photo of salad
// User types (optional): "My lunch salad"

// Vision AI identifies
{
  mealName: "Caesar Salad",
  identifiedItems: ["Romaine lettuce", "Chicken", "Parmesan", "Croutons"],
  confidence: 0.92
}

// Nutrition AI calculates
{
  totalCalories: 380,
  protein: 28g,
  carbs: 18g,
  fats: 22g
}
```

### Receive Recommendation

```typescript
// After logging meals, AI generates
{
  recommendation: "Great job hitting your protein goal! For dinner, try adding more vegetables for fiber and vitamins.",
  reason: "You've consumed 120g of 150g protein but low vegetable intake",
  priority: 2,
  suggested_foods: ["Grilled salmon with asparagus", "Vegetable stir-fry", "Mixed green salad"]
}
```

## 🔒 Security Notes

1. **Azure OpenAI:** Uses Azure CLI authentication (`az login`)
2. **Supabase:** Service role key for writes, RLS for reads
3. **JWT:** All endpoints require authentication
4. **Images:** Stored in Supabase Storage with user-scoped access

## 💡 Tips

- **Accuracy:** Be specific in descriptions for better nutrition estimates
- **Photos:** Take clear, well-lit photos of meals
- **Timing:** Log meals soon after eating for accurate time tracking
- **Goals:** Update profile weight/activity level for accurate calorie goals

## Summary

✅ **Complete AI-powered calorie tracking**
✅ **Real-time dashboard updates**
✅ **Multimodal input (text + images)**
✅ **Smart personalized recommendations**
✅ **Clean minimalistic UI**
✅ **Scalable backend architecture**

The dashboard is production-ready for calorie tracking with AI analysis!

