# Netlify Deployment Guide

## Prerequisites

1. **GitHub/GitLab Account**: Your code should be in a Git repository
2. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
3. **Supabase Project**: Ensure your Supabase project is set up and running

## Environment Variables Setup

Before deploying, you need to set up your environment variables in Netlify:

### Required Environment Variables

1. **VITE_SUPABASE_URL**: Your Supabase project URL
2. **VITE_SUPABASE_ANON_KEY**: Your Supabase anonymous key

### How to Find These Values

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" and "anon public" key

## Deployment Steps

### Method 1: Deploy via Netlify UI (Recommended)

1. **Push your code to Git**:

   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Connect to Netlify**:

   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose your Git provider (GitHub, GitLab, etc.)
   - Select your repository

3. **Configure build settings**:

   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy site"

4. **Set environment variables**:

   - Go to Site settings > Environment variables
   - Add the following variables:
     - `VITE_SUPABASE_URL`: Your Supabase URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

5. **Redeploy**:
   - Go to Deploys tab
   - Click "Trigger deploy" > "Deploy site"

### Method 2: Deploy via Netlify CLI

1. **Install Netlify CLI**:

   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:

   ```bash
   netlify login
   ```

3. **Initialize and deploy**:

   ```bash
   netlify init
   netlify deploy --prod
   ```

4. **Set environment variables**:
   ```bash
   netlify env:set VITE_SUPABASE_URL "your-supabase-url"
   netlify env:set VITE_SUPABASE_ANON_KEY "your-supabase-anon-key"
   ```

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

### 2. SSL Certificate

- Netlify automatically provides SSL certificates
- No additional configuration needed

### 3. Function Configuration

Your Netlify functions (`sendEmail.js` and `sendWhatsApp.js`) are automatically deployed with the site.

## Troubleshooting

### Common Issues

1. **Build Failures**:

   - Check the build logs in Netlify
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **Environment Variables Not Working**:

   - Ensure variables start with `VITE_` for client-side access
   - Redeploy after adding environment variables
   - Check variable names for typos

3. **Routing Issues**:

   - The `_redirects` file handles client-side routing
   - Ensure all routes redirect to `index.html`

4. **Supabase Connection Issues**:
   - Verify Supabase URL and key are correct
   - Check Supabase project status
   - Ensure RLS policies are configured correctly

### Build Optimization

1. **Enable Build Caching**:

   - Netlify automatically caches `node_modules`
   - Add `npm ci` to build command for faster builds

2. **Optimize Bundle Size**:
   - Use dynamic imports for large components
   - Enable code splitting in Vite config

## Monitoring and Analytics

### 1. Netlify Analytics

- Go to Site settings > Analytics
- Enable analytics for traffic monitoring

### 2. Error Tracking

- Consider adding error tracking (Sentry, LogRocket)
- Monitor Netlify function logs

### 3. Performance Monitoring

- Use Netlify's built-in performance insights
- Monitor Core Web Vitals

## Security Considerations

1. **Environment Variables**:

   - Never commit sensitive keys to Git
   - Use Netlify's environment variable system
   - Rotate keys regularly

2. **CORS Configuration**:

   - Configure Supabase CORS settings
   - Add your Netlify domain to allowed origins

3. **Content Security Policy**:
   - Consider adding CSP headers
   - Monitor security headers in browser dev tools

## Support

If you encounter issues:

1. Check Netlify's [documentation](https://docs.netlify.com)
2. Review build logs in Netlify dashboard
3. Test locally with `npm run build` and `npm run preview`
4. Verify all environment variables are set correctly

## Quick Deploy Checklist

- [ ] Code pushed to Git repository
- [ ] Environment variables configured in Netlify
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Supabase project is active
- [ ] RLS policies configured
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate active
- [ ] Functions deployed successfully
- [ ] Site is accessible and functional
