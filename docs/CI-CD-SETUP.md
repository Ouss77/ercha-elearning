# CI/CD Setup Guide

This project is configured for continuous integration and deployment to Vercel. This guide will help you set up automated deployments.

## 🚀 Quick Setup

### 1. Vercel Dashboard Setup (Easiest Method)

1. **Sign up/Login to Vercel**: Visit [vercel.com](https://vercel.com)
2. **Import Project**:
   - Click "Add New Project"
   - Connect your GitHub account
   - Import the `ercha-elearning` repository
3. **Configure Environment Variables**:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Run `openssl rand -base64 32` to generate
   - `NEXTAUTH_URL`: Will be auto-populated by Vercel (e.g., `https://your-app.vercel.app`)
4. **Deploy**: Click "Deploy" and Vercel will handle the rest!

Vercel will automatically:
- Deploy on every push to `main` (production)
- Create preview deployments for every PR
- Build and optimize your Next.js application

## 🔧 GitHub Actions CI/CD (Optional)

For additional automated testing and custom deployment workflows, we've included GitHub Actions.

### Required GitHub Secrets

Add these to your repository: Settings → Secrets and variables → Actions → New repository secret

| Secret Name | How to Get It | Description |
|-------------|---------------|-------------|
| `VERCEL_TOKEN` | Vercel → Settings → Tokens → Create Token | API token for Vercel deployments |
| `VERCEL_ORG_ID` | Vercel → Settings → General (copy Team ID) | Your Vercel organization/team ID |
| `VERCEL_PROJECT_ID` | After first Vercel deploy, check `.vercel/project.json` | Project-specific identifier |
| `DATABASE_URL` | Your Neon dashboard | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` | Secret for session encryption |
| `NEXTAUTH_URL` | Your production URL | Full URL to your app |

### Workflows Included

#### 1. **CI Workflow** (`.github/workflows/ci.yml`)
- **Triggers**: All pushes and PRs
- **Actions**:
  - Linting
  - Type checking
  - Build verification
- **Purpose**: Ensure code quality before deployment

#### 2. **Preview Deployment** (`.github/workflows/preview.yml`)
- **Triggers**: Pull requests to `main`
- **Actions**: Deploy preview environment to Vercel
- **Purpose**: Test changes before merging

#### 3. **Production Deployment** (`.github/workflows/production.yml`)
- **Triggers**: Pushes to `main` branch
- **Actions**: Deploy to production on Vercel
- **Purpose**: Automatic production deployments

## 📝 Configuration Files

### `vercel.json`
Configures Vercel deployment settings:
- Build command: `pnpm build`
- Framework: Next.js
- Environment variables
- Region: `iad1` (US East)

### `.env.example`
Template for required environment variables. Copy to `.env.local` for local development:

```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

## 🔐 Environment Variables

### Required for Deployment

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host.neon.tech/db?sslmode=require` |
| `NEXTAUTH_SECRET` | Secret for NextAuth sessions | Generated 32-byte string |
| `NEXTAUTH_URL` | Full application URL | `https://najmacademy.vercel.app` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |

## 🛠️ Local Development

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Set up database**:
   ```bash
   pnpm db:push
   pnpm db:seed
   ```

4. **Run development server**:
   ```bash
   pnpm dev
   ```

5. **Open browser**: [http://localhost:3000](http://localhost:3000)

## 🎯 Deployment Workflow

### Automatic Deployments

1. **Make changes** in a feature branch
2. **Create PR** to `main`
   - CI workflow runs automatically
   - Preview deployment created
3. **Review & test** preview deployment
4. **Merge PR** to `main`
   - Production deployment triggered automatically
   - Live site updated

### Manual Deployment (Vercel CLI)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 🐛 Troubleshooting

### Build Failures

**Problem**: Build fails on Vercel
- ✅ Check environment variables are set correctly
- ✅ Verify `DATABASE_URL` is accessible from Vercel
- ✅ Review build logs in Vercel dashboard

### Database Connection Issues

**Problem**: Can't connect to database
- ✅ Ensure `DATABASE_URL` includes `?sslmode=require`
- ✅ Check Neon database is active
- ✅ Verify connection pooling settings

### Authentication Not Working

**Problem**: Login fails in production
- ✅ Verify `NEXTAUTH_URL` matches your production URL
- ✅ Check `NEXTAUTH_SECRET` is set
- ✅ Ensure cookies are enabled in browser

### GitHub Actions Failing

**Problem**: Workflows fail
- ✅ Verify all GitHub secrets are set
- ✅ Check secret names match exactly
- ✅ Review workflow logs in GitHub Actions tab

## 📊 Monitoring

### Vercel Dashboard
- **Deployments**: View all deployments and their status
- **Analytics**: Track page views and performance (via `@vercel/analytics`)
- **Logs**: Real-time and historical logs
- **Functions**: Serverless function metrics

### GitHub
- **Actions**: View CI/CD workflow runs
- **Pull Requests**: Preview deployments linked automatically

## 🔄 Rollback

If a deployment causes issues:

1. Go to **Vercel Dashboard** → **Deployments**
2. Find the last working deployment
3. Click **"⋯"** → **"Promote to Production"**

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Neon Database Docs](https://neon.tech/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## ✅ Checklist

Before deploying to production:

- [ ] Database is set up and seeded
- [ ] All environment variables configured in Vercel
- [ ] `NEXTAUTH_SECRET` is strong and secure
- [ ] `NEXTAUTH_URL` points to production domain
- [ ] GitHub secrets configured (if using Actions)
- [ ] Test authentication flow
- [ ] Verify all pages load correctly
- [ ] Check API routes work properly

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check GitHub Actions workflow logs
4. Consult the additional resources

---

**Ready to deploy?** Follow the Quick Setup section above to get started! 🚀
