# Development User Creation Workaround

## ⚠️ WARNING: Development Only

This solution is **ONLY for development and testing purposes**. Never use this in production as it exposes sensitive keys.

## Quick Setup for Testing

### 1. Add Service Role Key to Environment

Add your Supabase service role key to `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Add this line
```

### 2. Create Development User Creation Function

Create a new file `src/lib/devSupabase.js`:

```javascript
import { createClient } from "@supabase/supabase-js";

// Development-only Supabase client with service role
const devSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

export const devCreateUser = async (userData) => {
  try {
    console.warn("⚠️ Using development user creation - NOT for production!");

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await devSupabase.auth.admin.createUser({
        email: userData.email,
        phone: userData.phone,
        password: userData.password || "tempPassword123!",
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          role: userData.role,
        },
      });

    if (authError) throw authError;

    // Create user account record
    const { error: accountError } = await devSupabase
      .from("user_accounts")
      .insert([
        {
          user_id: authData.user.id,
          username: userData.email,
          role: userData.role,
          created_at: new Date().toISOString(),
        },
      ]);

    if (accountError) throw accountError;

    return authData.user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
```

### 3. Update AdminPanel to Use Development Function

Modify `src/pages/AdminPanel.jsx` to use the development function:

```javascript
import { devCreateUser } from "@/lib/devSupabase";

// In the createUser function:
const createUser = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Use development function for testing
    await devCreateUser(newUser);
    toast.success(`${newUser.role} account created successfully!`);
    setNewUser({ email: "", phone: "", role: "customer", name: "" });
    fetchUsers();
  } catch (error) {
    console.error("Error creating user:", error);
    toast.error("Failed to create user account. Please try again.");
  } finally {
    setLoading(false);
  }
};
```

## How to Get Your Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the "service_role" key (not the anon key)
4. Add it to your `.env.local` file

## Testing the Workaround

1. **Add the service role key** to your environment variables
2. **Create the development function** as shown above
3. **Update the AdminPanel** to use the development function
4. **Test user creation** through the Admin Panel
5. **Verify users are created** in both Supabase Auth and your database

## Security Reminders

### ✅ Safe for Development:

- Testing user creation functionality
- Development environment only
- Local development server

### ❌ Never Do:

- Commit service role key to version control
- Use in production environment
- Share the service role key
- Deploy with this workaround

## Production Migration

When ready for production:

1. **Remove the development workaround**
2. **Implement the backend API solution** from `BACKEND_USER_CREATION_GUIDE.md`
3. **Remove service role key** from frontend environment
4. **Test thoroughly** with the secure backend solution

## Current Status

The application is working correctly with proper error handling. This workaround is only needed if you want to test user creation functionality immediately during development.

For production, always use the secure backend API approach.
