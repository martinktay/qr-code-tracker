# SmartTrack Deployment Guide

## 🚀 Complete Setup Instructions

### 1. Database Setup (Supabase)

#### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

#### 1.2 Run Database Schema

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire content of `supabase_schema.sql`
4. Execute the script

#### 1.3 Create Storage Buckets

```sql
-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES
('parcel-photos', 'parcel-photos', true),
('chat-files', 'chat-files', true),
('company-assets', 'company-assets', true);
```

#### 1.4 Set up Row Level Security (RLS)

The schema already includes RLS policies, but verify they're active:

```sql
-- Verify RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('customers', 'boxes', 'sacks', 'scan_history', 'user_accounts', 'company_settings', 'messages');
```

### 2. Environment Configuration

#### 2.1 Create Environment File

Create `.env.local` in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_whatsapp_number

# SMTP Configuration (for email notifications)
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

#### 2.2 Twilio WhatsApp Setup

1. Create a Twilio account at [twilio.com](https://twilio.com)
2. Set up WhatsApp Business API
3. Get your Account SID and Auth Token
4. Note your WhatsApp phone number

#### 2.3 SMTP Server Setup

Choose one of these options:

**Option A: Gmail SMTP**

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**Option B: SendGrid**

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

**Option C: Mailgun**

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_username
SMTP_PASS=your_mailgun_password
```

### 3. Local Development

#### 3.1 Install Dependencies

```bash
npm install
```

#### 3.2 Start Development Server

```bash
npm run dev
```

#### 3.3 Test Messaging Features

1. Open the application in your browser
2. Create a test user account
3. Register a test parcel (box or sack)
4. Navigate to the parcel timeline
5. Test the chat functionality
6. Verify WhatsApp and email notifications

### 4. Production Deployment

#### 4.1 Netlify Deployment (Recommended)

1. **Connect Repository**

   - Push your code to GitHub
   - Connect your repository to Netlify

2. **Configure Build Settings**

   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Set Environment Variables**

   - Go to Site settings > Environment variables
   - Add all variables from your `.env.local` file

4. **Deploy Functions**
   - The `netlify/functions/` directory will be automatically deployed
   - Verify functions are accessible at `/.netlify/functions/sendWhatsApp` and `/.netlify/functions/sendEmail`

#### 4.2 Vercel Deployment

1. **Import Project**

   - Connect your GitHub repository to Vercel
   - Configure build settings

2. **Set Environment Variables**

   - Add all environment variables in Vercel dashboard

3. **Deploy**
   - Vercel will automatically deploy your application

### 5. Testing Checklist

#### 5.1 Core Functionality

- [ ] User registration and login
- [ ] Parcel registration (boxes and sacks)
- [ ] QR code generation and scanning
- [ ] Status updates and scan logging
- [ ] Customer portal tracking

#### 5.2 Messaging Features

- [ ] In-app chat functionality
- [ ] Real-time message updates
- [ ] File upload in chat
- [ ] WhatsApp notifications
- [ ] Email notifications
- [ ] Multi-language support

#### 5.3 Admin Features

- [ ] Company settings management
- [ ] User management
- [ ] Messaging controls
- [ ] Notification toggles

### 6. Troubleshooting

#### 6.1 Common Issues

**Database Connection Errors**

```bash
# Check Supabase URL and key
# Verify RLS policies are active
# Check if tables exist
```

**WhatsApp Notifications Not Working**

```bash
# Verify Twilio credentials
# Check WhatsApp number format (+1234567890)
# Test with Twilio console first
```

**Email Notifications Not Working**

```bash
# Verify SMTP credentials
# Check firewall/port restrictions
# Test SMTP connection manually
```

**Real-time Chat Not Working**

```bash
# Check Supabase real-time is enabled
# Verify subscription filters
# Check browser console for errors
```

#### 6.2 Debug Commands

```javascript
// Test messaging features in browser console
testMessagingFeatures();

// Check Supabase connection
console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);

// Test database helpers
db.getCompanySettings().then(console.log);
```

### 7. Security Considerations

#### 7.1 Environment Variables

- Never commit `.env.local` to version control
- Use different keys for development and production
- Rotate API keys regularly

#### 7.2 Database Security

- RLS policies are already configured
- Review and customize policies as needed
- Monitor database access logs

#### 7.3 API Security

- Rate limit WhatsApp and email functions
- Validate all input data
- Implement proper error handling

### 8. Performance Optimization

#### 8.1 Database Optimization

- Add indexes for frequently queried columns
- Monitor query performance
- Optimize real-time subscriptions

#### 8.2 File Storage

- Compress images before upload
- Set appropriate file size limits
- Use CDN for file delivery

#### 8.3 Caching

- Implement client-side caching for parcel data
- Cache company settings
- Use service workers for offline functionality

### 9. Monitoring and Analytics

#### 9.1 Error Tracking

- Set up error monitoring (Sentry, LogRocket)
- Monitor function execution logs
- Track user interactions

#### 9.2 Performance Monitoring

- Monitor page load times
- Track API response times
- Monitor real-time connection status

### 10. Maintenance

#### 10.1 Regular Tasks

- Update dependencies monthly
- Review and rotate API keys
- Monitor storage usage
- Backup database regularly

#### 10.2 Scaling Considerations

- Monitor database performance
- Consider read replicas for high traffic
- Implement connection pooling
- Use edge functions for global deployment

---

## 🎉 Deployment Complete!

Your SmartTrack logistics platform is now ready for production use with full messaging capabilities!

For support, refer to the main README.md file or contact the development team.
