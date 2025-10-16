# Deployment Guide

This document provides instructions for deploying the Najm Academy Platform to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A GitHub account with access to this repository
3. A Neon database (or other PostgreSQL database)
4. Access to repository settings to add secrets

## Quick Start with Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `ercha-elearning` repository

2. **Configure Environment Variables**
   
   Add the following environment variables in Vercel dashboard:
   
   - `DATABASE_URL`: Your Neon/PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your production URL (e.g., `https://your-app.vercel.app`)
   - `NODE_ENV`: Set to `production`

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link Project**
   ```bash
   vercel link
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   ```

5. **Deploy to Preview**
   ```bash
   vercel
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## CI/CD with GitHub Actions

This project includes GitHub Actions workflows for automated deployment:

### Setup GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to repository Settings → Secrets and variables → Actions
2. Add the following secrets:

   - `VERCEL_TOKEN`: Get from Vercel → Settings → Tokens
   - `VERCEL_ORG_ID`: Get from Vercel → Settings → General
   - `VERCEL_PROJECT_ID`: Get from project's `.vercel/project.json` after first deployment
   - `DATABASE_URL`: Your database connection string
   - `NEXTAUTH_SECRET`: Your NextAuth secret
   - `NEXTAUTH_URL`: Your production URL

### Workflows

- **CI** (`ci.yml`): Runs on all pushes and PRs to validate code
- **Preview** (`preview.yml`): Deploys preview environments for PRs
- **Production** (`production.yml`): Deploys to production on main branch

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js sessions | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Application URL | `https://your-app.vercel.app` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |

## Database Setup

Before deploying, ensure your database is properly set up:

1. **Run Migrations**
   ```bash
   pnpm db:push
   ```

2. **Seed Database** (if needed)
   ```bash
   pnpm db:seed
   ```

## Post-Deployment

1. **Verify Deployment**
   - Visit your Vercel URL
   - Test the login functionality
   - Check that all pages load correctly

2. **Monitor**
   - Use Vercel Analytics (already integrated via `@vercel/analytics`)
   - Check Vercel Logs for any errors

3. **Custom Domain** (Optional)
   - Go to Vercel project settings → Domains
   - Add your custom domain
   - Update `NEXTAUTH_URL` environment variable

## Troubleshooting

### Build Errors

- Check Vercel build logs
- Ensure all environment variables are set
- Verify database connection string is correct

### Authentication Issues

- Verify `NEXTAUTH_SECRET` is set
- Ensure `NEXTAUTH_URL` matches your deployment URL
- Check that cookies are enabled

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check Neon database is accessible
- Ensure IP allowlist includes Vercel IPs (if applicable)

## Rollback

If you need to rollback a deployment:

1. Go to Vercel Dashboard → Deployments
2. Find the previous working deployment
3. Click "Promote to Production"

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Neon Documentation](https://neon.tech/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
