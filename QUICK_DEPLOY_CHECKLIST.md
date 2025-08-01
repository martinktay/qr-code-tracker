# Quick Deployment Checklist

## ✅ Pre-Deployment Checks

- [x] **Project Structure**: All required files present
- [x] **Dependencies**: All packages installed
- [x] **Build Test**: Project builds successfully
- [x] **Environment Variables**: Supabase credentials configured
- [x] **Git Repository**: Code is in version control
- [x] **Netlify Configuration**: `netlify.toml` and `_redirects` files created

## 🚀 Deployment Steps

### 1. Push to Git Repository

```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### 2. Deploy to Netlify

#### Option A: Via Netlify UI (Recommended)

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Choose your Git provider (GitHub, GitLab, etc.)
4. Select your repository: `qr-code-tracker`
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Deploy site"

#### Option B: Via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### 3. Configure Environment Variables

In Netlify dashboard:

1. Go to Site settings > Environment variables
2. Add the following variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### 4. Redeploy with Environment Variables

1. Go to Deploys tab
2. Click "Trigger deploy" > "Deploy site"

## 🔧 Post-Deployment Configuration

### 1. Custom Domain (Optional)

- Go to Site settings > Domain management
- Add your custom domain
- Configure DNS settings

### 2. SSL Certificate

- Netlify automatically provides SSL
- No additional configuration needed

### 3. Function Verification

- Your Netlify functions are automatically deployed
- Test: `https://your-site.netlify.app/.netlify/functions/sendEmail`
- Test: `https://your-site.netlify.app/.netlify/functions/sendWhatsApp`

## 🧪 Testing Checklist

After deployment, test these features:

### Core Functionality

- [ ] User registration and login
- [ ] QR code generation and scanning
- [ ] Parcel registration (boxes and sacks)
- [ ] Status updates and tracking
- [ ] Customer portal access

### Admin Features

- [ ] Admin panel access
- [ ] User management
- [ ] Company settings
- [ ] Analytics dashboard

### Communication Features

- [ ] In-app messaging
- [ ] Email notifications
- [ ] WhatsApp integration
- [ ] File uploads

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**

   - Check build logs in Netlify
   - Verify all dependencies are in `package.json`
   - Ensure Node.js version compatibility

2. **Environment Variables Not Working**

   - Ensure variables start with `VITE_`
   - Redeploy after adding variables
   - Check for typos in variable names

3. **Supabase Connection Issues**

   - Verify Supabase URL and key
   - Check Supabase project status
   - Ensure RLS policies are configured

4. **Routing Issues**
   - Verify `_redirects` file is in `public/` directory
   - Check that all routes redirect to `index.html`

### Debug Commands

```bash
# Test build locally
npm run build
npm run preview

# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test Netlify functions locally
netlify dev
```

## 📞 Support

If you encounter issues:

1. Check Netlify's [documentation](https://docs.netlify.com)
2. Review build logs in Netlify dashboard
3. Test locally with `npm run build` and `npm run preview`
4. Verify all environment variables are set correctly

## 🎉 Success!

Once deployed successfully, your QR code tracker will be available at:
`https://your-site-name.netlify.app`

Your client can now access the application and test all features!
