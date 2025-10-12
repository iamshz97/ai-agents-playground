# JWT Authentication Flow Guide

## Overview

SmartEato uses **Supabase JWT tokens** for authentication. The mobile app authenticates with Supabase, receives a JWT token, and sends it to the .NET backend API for verification.

## How It Works

### 1. User Authentication Flow

```
Mobile App                    Supabase              .NET API
    |                            |                     |
    |--[Login Email/Password]--->|                     |
    |<--[JWT Token + User Info]--|                     |
    |                            |                     |
    |--[API Request + JWT Token]-------------------->|
    |                            |                     |
    |                            |                     |--[Validate JWT]
    |                            |                     |--[Extract Claims]
    |                            |                     |--[Check Permissions]
    |                            |                     |
    |<--[API Response]----------------------------|
```

### 2. JWT Token Structure (Supabase)

Supabase JWT tokens contain these important claims:

```json
{
  "sub": "user-uuid-here",           // User ID
  "email": "user@example.com",       // User email
  "role": "authenticated",           // User role
  "aud": "authenticated",            // Audience
  "exp": 1234567890,                 // Expiration timestamp
  "iat": 1234567890                  // Issued at timestamp
}
```

### 3. Mobile App - Sending JWT Token

The mobile app automatically includes the JWT token in every API request:

**File:** `src/api/client.ts`

```typescript
this.client.interceptors.request.use(
  async (config) => {
    // Get Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      // Add JWT token to Authorization header
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  }
);
```

**What happens:**
- Before each API call, fetch the current Supabase session
- Extract the `access_token` from the session
- Add it to the `Authorization` header as `Bearer <token>`

### 4. Backend API - Validating JWT Token

The .NET backend validates the JWT token in multiple steps:

#### Step 1: JWT Bearer Authentication Middleware

**File:** `Extensions/SupabaseAuthExtensions.cs`

```csharp
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecret)
            ),
            ValidateAudience = true,
            ValidAudience = "authenticated",
            ValidateLifetime = true,
            NameClaimType = "sub"  // Maps 'sub' claim to User.Identity.Name
        };
    });
```

**What it validates:**
- ✅ Token signature (using JWT secret from Supabase)
- ✅ Token audience (must be "authenticated")
- ✅ Token expiration (not expired)
- ✅ Token structure (valid JWT format)

#### Step 2: Supabase Auth Middleware

**File:** `Middleware/SupabaseAuthMiddleware.cs`

```csharp
public async Task InvokeAsync(HttpContext context)
{
    if (context.User.Identity?.IsAuthenticated == true)
    {
        // Extract user ID from 'sub' claim
        var userIdClaim = context.User.FindFirst("sub");
        context.Items["UserId"] = userIdClaim.Value;
        
        // Extract email from 'email' claim
        var emailClaim = context.User.FindFirst("email");
        context.Items["UserEmail"] = emailClaim.Value;
    }
    
    await _next(context);
}
```

**What it does:**
- Extracts user information from validated JWT claims
- Stores them in `HttpContext.Items` for easy access
- Logs authentication events

#### Step 3: Using User Information in Endpoints

**File:** `Endpoints/Profiles/CreateProfileEndpoint.cs`

```csharp
app.MapPost("api/profile", async (
    HttpContext httpContext,
    ILogger logger) =>
{
    // Easy access to authenticated user info
    var userId = httpContext.GetUserId();       // Gets UUID from 'sub' claim
    var userEmail = httpContext.GetUserEmail(); // Gets email from 'email' claim
    
    logger.LogInformation("User {UserId} ({Email}) creating profile", 
        userId, userEmail);
})
.RequireAuthorization();  // ← Requires valid JWT token
```

### 5. Extension Methods for Easy Access

**File:** `Middleware/SupabaseAuthMiddleware.cs`

We provide extension methods to easily access user information:

```csharp
// Get user ID (throws if not authenticated)
Guid userId = httpContext.GetUserId();

// Get user email (throws if not authenticated)
string email = httpContext.GetUserEmail();

// Get user role (returns null if not found)
string? role = httpContext.GetUserRole();
```

## Configuration Required

### Mobile App - `.env` File

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
API_BASE_URL=http://10.0.2.2:5000
```

### Backend API - `appsettings.json`

```json
{
  "Supabase": {
    "Url": "https://your-project.supabase.co",
    "Key": "your_service_role_key",
    "JwtSecret": "your_jwt_secret_from_supabase"
  }
}
```

**⚠️ CRITICAL:** The `JwtSecret` must match your Supabase project's JWT secret!

### How to Get JWT Secret from Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Scroll to **JWT Settings**
4. Copy the **JWT Secret** (NOT the anon key!)
5. Paste it into `appsettings.json` under `Supabase:JwtSecret`

## Troubleshooting

### Issue: 401 Unauthorized

**Possible Causes:**

1. **JWT Secret Mismatch**
   - ❌ Backend JWT secret doesn't match Supabase project
   - ✅ **Fix:** Copy the correct JWT secret from Supabase → API Settings → JWT Secret

2. **Token Not Being Sent**
   - ❌ Mobile app not including Authorization header
   - ✅ **Fix:** Verify `src/api/client.ts` includes the token interceptor

3. **Token Expired**
   - ❌ JWT token has expired
   - ✅ **Fix:** Supabase auto-refreshes tokens, but user may need to re-login

4. **Audience Mismatch**
   - ❌ Token audience doesn't match expected value
   - ✅ **Fix:** Supabase tokens should have `aud: "authenticated"` by default

### Issue: User ID Not Found

**Possible Causes:**

1. **Token Validated But Claims Missing**
   - ❌ JWT is valid but doesn't contain expected claims
   - ✅ **Fix:** Check token structure with a JWT debugger (jwt.io)

2. **Claim Name Mismatch**
   - ❌ Looking for wrong claim name
   - ✅ **Fix:** Supabase uses `sub` for user ID, `email` for email

### Debugging Tips

#### 1. Enable Detailed Logging

The backend logs authentication events. Check your logs for:

```
Token validated. Claims: sub=user-id, email=user@email.com, role=authenticated
User authenticated - ID: user-id
User email: user@email.com
```

#### 2. Decode JWT Token (Development Only)

Visit [jwt.io](https://jwt.io) and paste your JWT token to inspect claims.

**Example token payload:**
```json
{
  "aud": "authenticated",
  "exp": 1697654400,
  "iat": 1697650800,
  "iss": "https://your-project.supabase.co/auth/v1",
  "sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "user@example.com",
  "phone": "",
  "app_metadata": {},
  "user_metadata": {},
  "role": "authenticated"
}
```

#### 3. Test Authentication

Use curl or Postman to test:

```bash
# Get token from Supabase
TOKEN="your_jwt_token_here"

# Test API endpoint
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `200 OK` with profile data  
If `401`: JWT validation failed

#### 4. Check Mobile App Token

In mobile app, log the token:

```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log('JWT Token:', session?.access_token);
```

Verify:
- Token is not null
- Token is a long string starting with `eyJ`
- Token is being sent in API requests

## Security Best Practices

### ✅ DO

- Store JWT secret in environment variables or user secrets
- Use HTTPS in production
- Validate token on every protected endpoint
- Check token expiration
- Log authentication failures
- Use service role key only on backend (never in mobile app)

### ❌ DON'T

- Don't commit JWT secret to version control
- Don't expose service role key to mobile app
- Don't disable token expiration validation
- Don't store JWT secret in plain text in production
- Don't trust client-side validation only

## Example: Creating a New Protected Endpoint

```csharp
public class GetUserStatsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/stats", async (
            HttpContext httpContext,
            ILogger logger) =>
        {
            // Get authenticated user info
            var userId = httpContext.GetUserId();
            var userEmail = httpContext.GetUserEmail();
            
            logger.LogInformation(
                "User {UserId} ({Email}) requesting stats", 
                userId, 
                userEmail
            );
            
            // Your business logic here
            return Results.Ok(new { userId, userEmail });
        })
        .RequireAuthorization()  // ← This makes it protected
        .WithTags("Stats");
    }
}
```

**Key Points:**
- Add `.RequireAuthorization()` to require JWT token
- Use `httpContext.GetUserId()` to get authenticated user ID
- Use `httpContext.GetUserEmail()` to get authenticated user email
- Handle `UnauthorizedAccessException` for better error messages

## Summary

### Mobile App
1. ✅ User logs in with Supabase
2. ✅ Receives JWT token
3. ✅ Automatically includes token in API requests via interceptor

### Backend API  
1. ✅ Receives request with JWT token in `Authorization: Bearer <token>`
2. ✅ Validates token signature, audience, expiration
3. ✅ Extracts user ID and email from claims
4. ✅ Makes them easily accessible via extension methods
5. ✅ Logs all authentication events

### You Can Now
- ✅ Identify which user is making the request
- ✅ Access user email for logging/notifications
- ✅ Ensure only authenticated users access protected endpoints
- ✅ Track user activity with user ID and email

---

**Need Help?**
- Check API logs for authentication errors
- Verify JWT secret matches Supabase project
- Test with curl/Postman to isolate mobile vs backend issues
- Decode JWT at jwt.io to inspect claims

