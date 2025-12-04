# Solar PV Designer - Deployment Guide

## Overview

This guide covers deploying the Solar PV Designer to Netlify. The application consists of a Next.js frontend and an Express.js backend with Python simulation services.

## Prerequisites

1. **Netlify Account**: Create a free account at [netlify.com](https://netlify.com)
2. **GitHub Repository**: Your code should be pushed to a GitHub repository
3. **Node.js**: v18 or higher (for local builds)
4. **pnpm**: v8 or higher (package manager)

## Frontend Deployment (Netlify)

### 1. Configure Environment Variables

In Netlify dashboard, go to **Site settings > Environment variables** and add:

```env
NEXT_PUBLIC_API_URL=https://your-server-domain.com/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Connect GitHub Repository

1. In Netlify dashboard, click **"Add new site"**
2. Select **"Import an existing project"**
3. Choose **GitHub** and connect your repository
4. Configure build settings:
   - **Build command**: `pnpm run build`
   - **Publish directory**: `out`
   - **Node version**: `18`
   - **Environment variables**: Add the ones from step 1

### 3. Deploy

Click **"Deploy site"**. Netlify will automatically build and deploy your frontend.

## Backend Deployment Options

### Option 1: Vercel (Recommended for Backend)

1. Push your server code to a separate GitHub repository
2. Connect to Vercel
3. Configure environment variables
4. Deploy automatically

### Option 2: Railway/Render

1. Push server code to GitHub
2. Connect to Railway or Render
3. Configure Dockerfile (if needed)
4. Set up PostgreSQL database
5. Deploy

### Option 3: Traditional VPS

1. Set up a VPS (DigitalOcean, AWS EC2, etc.)
2. Install Node.js, PostgreSQL, and Python
3. Clone your server repository
4. Install dependencies:
   ```bash
   cd /path/to/server
   pnpm install
   pnpm build
   ```
5. Set up environment variables
6. Run with PM2:
   ```bash
   npm install -g pm2
   pm2 start src/server.ts --name solar-api
   pm2 save
   pm2 startup
   ```

## Python Simulation Service Deployment

### 1. Install Python Dependencies

```bash
cd server/pvlib_api
pip install -r requirements.txt
```

### 2. Run with Gunicorn (Production)

```bash
gunicorn SPVSimAPI:app --workers 4 --bind 0.0.0.0:8001
```

### 3. Systemd Service (Linux)

Create `/etc/systemd/system/solar-simulation.service`:

```ini
[Unit]
Description=Solar PV Simulation Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/server/pvlib_api
Environment=PATH=/path/to/venv/bin
ExecStart=/path/to/venv/bin/gunicorn SPVSimAPI:app --workers 4 --bind 0.0.0.0:8001
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable solar-simulation
sudo systemctl start solar-simulation
```

## Database Setup

### PostgreSQL Configuration

1. Create database:
   ```sql
   CREATE DATABASE solar_pv_designer;
   ```

2. Run migrations:
   ```bash
   cd server
   pnpm prisma migrate deploy
   ```

3. Seed data:
   ```bash
   pnpm run seed
   ```

## DNS and SSL Configuration

### 1. Configure DNS

- Point your domain to Netlify's DNS servers
- Set up A records for your backend server

### 2. SSL Certificates

- Netlify provides automatic SSL for frontend
- Use Let's Encrypt for backend SSL certificates
- Configure reverse proxy if needed

## Monitoring and Maintenance

### 1. Error Tracking

Set up error tracking services:
- **Frontend**: Netlify analytics, error boundaries
- **Backend**: Sentry, LogRocket

### 2. Performance Monitoring

- **Frontend**: Netlify Site Analytics, Google PageSpeed Insights
- **Backend**: Application monitoring tools

### 3. Backup Strategy

- **Database**: Daily automated backups
- **Code**: Version control with Git
- **Configuration**: Infrastructure as Code

## Testing the Deployment

### 1. Frontend Tests

```bash
# Test locally
pnpm test
pnpm build

# Test on staging
# Deploy to staging environment
# Run smoke tests
```

### 2. Backend Tests

```bash
# Test API endpoints
curl https://your-domain.com/api/organizations

# Test authentication
curl -X POST https://your-domain.com/api/auth/login
```

### 3. Integration Tests

- Test full user flow from landing to simulation
- Verify AI wizard functionality
- Test manual wizard with various configurations
- Validate simulation results

## Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **API Errors**:
   - Verify environment variables
   - Check server logs
   - Test API endpoints directly

3. **Simulation Errors**:
   - Ensure Python service is running
   - Check PVLib API health: `curl http://localhost:8001/health`
   - Verify simulation data format

4. **Database Issues**:
   - Check database connection string
   - Verify migrations are applied
   - Test database connectivity

### Debug Mode

Enable debug mode in production:
```bash
# Add to environment variables
DEBUG=true
LOG_LEVEL=debug
```

## Performance Optimization

### Frontend Optimization

1. **Bundle Analysis**:
   ```bash
   pnpm run build:analyze
   ```

2. **Image Optimization**:
   - Use optimized image formats
   - Implement lazy loading
   - Use CDN for static assets

3. **Code Splitting**:
   - Dynamic imports for large components
   - Route-based code splitting

### Backend Optimization

1. **Database Optimization**:
   - Add database indexes
   - Optimize query performance
   - Implement connection pooling

2. **Caching**:
   - Redis for session storage
   - API response caching
   - Static asset caching

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS**: Enforce HTTPS in production
3. **CORS**: Configure proper CORS settings
4. **Rate Limiting**: Implement API rate limiting
5. **Input Validation**: Validate all user inputs
6. **Dependencies**: Keep dependencies updated

## Rollback Plan

1. **Frontend**: Netlify maintains previous deployments
2. **Backend**: Use blue-green deployment strategy
3. **Database**: Create backups before major changes
4. **Monitoring**: Set up alerts for deployment failures

## Support

For deployment issues:
1. Check Netlify documentation
2. Review error logs
3. Test in staging environment
4. Contact support if needed

---

**Note**: This deployment guide covers the most common deployment scenarios. Adjust based on your specific infrastructure requirements and constraints.