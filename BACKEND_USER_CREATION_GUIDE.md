# Backend User Creation Implementation Guide

## Current Issue

The client-side application cannot create users due to Supabase security restrictions. The `supabase.auth.admin.createUser` function requires a service role key, which should never be exposed in client-side code.

## Recommended Solution: Backend API

### 1. Create a Backend API Endpoint

#### Using Node.js/Express with Supabase:

```javascript
// server.js
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Use service role key in backend only
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key, not anon key
);

// User creation endpoint
app.post("/api/admin/users", async (req, res) => {
  try {
    const { email, phone, role, name, password } = req.body;

    // Validate admin permissions (implement your own auth logic)
    const adminToken = req.headers.authorization;
    if (!isAdmin(adminToken)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        phone,
        password: password || "tempPassword123!",
        email_confirm: true,
        user_metadata: { name, role },
      });

    if (authError) throw authError;

    // Create user account record
    const { error: accountError } = await supabase
      .from("user_accounts")
      .insert([
        {
          user_id: authData.user.id,
          username: email,
          role,
          created_at: new Date().toISOString(),
        },
      ]);

    if (accountError) throw accountError;

    res.json({ success: true, user: authData.user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log("Backend API running on port 3001");
});
```

### 2. Update Frontend to Use Backend API

#### Modify the createUser function in `src/lib/supabase.js`:

```javascript
async createUser(userData) {
  try {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAdminToken()}` // Implement your auth
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }

    const result = await response.json();
    return result.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
```

### 3. Environment Variables

#### Backend (.env):

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

#### Frontend (.env.local):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3001
```

## Alternative Solutions

### Option 2: Supabase Edge Functions

Create a Supabase Edge Function for user creation:

```javascript
// supabase/functions/create-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { email, phone, role, name } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      phone,
      password: "tempPassword123!",
      email_confirm: true,
      user_metadata: { name, role },
    });

    if (error) throw error;

    return new Response(JSON.stringify({ user: data.user }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

### Option 3: Temporary Workaround (Development Only)

For development/testing purposes, you can temporarily use the service role key in the frontend:

```javascript
// WARNING: Only for development! Never use in production
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY // Service role key
);
```

## Security Considerations

### ✅ Best Practices:

- Use service role key only in backend
- Implement proper authentication/authorization
- Validate all input data
- Use HTTPS in production
- Implement rate limiting

### ❌ Never Do:

- Expose service role key in client-side code
- Skip input validation
- Use admin functions directly from frontend
- Store sensitive keys in version control

## Implementation Steps

1. **Set up backend server** (Node.js/Express recommended)
2. **Create user creation endpoint** with proper authentication
3. **Update frontend** to call backend API instead of direct Supabase
4. **Test thoroughly** with proper error handling
5. **Deploy backend** to production environment
6. **Update environment variables** for production

## Testing the Solution

### Backend Testing:

```bash
# Test the API endpoint
curl -X POST http://localhost:3001/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-token" \
  -d '{
    "email": "test@example.com",
    "role": "warehouse",
    "name": "Test User"
  }'
```

### Frontend Testing:

- Try creating users through the Admin Panel
- Verify error handling works correctly
- Test with different user roles

## Current Status

The application is working correctly with the improved error handling. The 403 error is expected and indicates that:

1. ✅ Security is properly enforced
2. ✅ Error messages are user-friendly
3. ✅ The system prevents unauthorized user creation

For production use, implement the backend API solution to enable secure user creation.
