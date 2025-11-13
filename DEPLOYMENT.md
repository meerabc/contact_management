# Deployment Guide

This guide will help you deploy your Next.js Contact & Task Manager app to GitHub and Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Git installed on your machine

---

## Part 1: Deploy to GitHub

### Step 1: Initialize Git Repository (if not already done)

```bash
# Check if git is already initialized
git status

# If not initialized, run:
git init
```

### Step 2: Add All Files to Git

```bash
# Add all files to staging
git add .

# Check what will be committed
git status
```

### Step 3: Create Initial Commit

```bash
git commit -m "Initial commit: Next.js Contact & Task Manager"
```

### Step 4: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in the details:
   - **Repository name**: `nextjs-contact-task-manager` (or your preferred name)
   - **Description**: "Contact and Task Management App built with Next.js 14"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

### Step 5: Connect Local Repository to GitHub

GitHub will show you commands. Use these:

```bash
# Add GitHub as remote origin (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 6: Verify on GitHub

- Go to your repository on GitHub
- You should see all your files uploaded

---

## Part 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Sign up/Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub (easiest option)

2. **Import Project**
   - Click **"Add New..."** → **"Project"**
   - Click **"Import Git Repository"**
   - Select your GitHub repository
   - Click **"Import"**

3. **Configure Project**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

4. **Environment Variables** (if any)
   - Add any environment variables if needed
   - For this project, none are required

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes for build to complete

6. **Access Your App**
   - Vercel will provide a URL like: `https://your-app-name.vercel.app`
   - Your app is now live! 🎉

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - For production deployment:
   ```bash
   vercel --prod
   ```

---

## Post-Deployment

### Automatic Deployments

- **Every push to `main` branch** → Auto-deploys to production
- **Pull Requests** → Creates preview deployments
- **All deployments** are accessible via Vercel dashboard

### Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

---

## Troubleshooting

### Build Fails on Vercel

1. **Check Build Logs**
   - Go to Vercel dashboard → Your project → "Deployments"
   - Click on failed deployment → View logs

2. **Common Issues**:
   - **TypeScript errors**: Run `npm run type-check` locally
   - **Linting errors**: Run `npm run lint` locally
   - **Missing dependencies**: Ensure all dependencies are in `package.json`

### Fix Build Issues Locally

```bash
# Test build locally
npm run build

# Fix TypeScript errors
npm run type-check

# Fix linting errors
npm run lint
```

### Update Deployment

Simply push changes to GitHub:
```bash
git add .
git commit -m "Your commit message"
git push
```
Vercel will automatically redeploy!

---

## Important Notes

1. **Data Persistence**: 
   - Your JSON files in `lib/db/` are included in the repository
   - For production, consider using a proper database (PostgreSQL, MongoDB, etc.)

2. **Environment Variables**:
   - If you add environment variables later, add them in Vercel dashboard
   - Settings → Environment Variables

3. **Build Time**:
   - First deployment: ~2-3 minutes
   - Subsequent deployments: ~1-2 minutes

---

## Quick Reference Commands

```bash
# Git commands
git status                    # Check status
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push                      # Push to GitHub

# Local testing
npm run build                 # Test production build
npm run start                 # Test production server
npm run lint                  # Check for linting errors
npm run type-check            # Check TypeScript errors

# Vercel CLI
vercel                        # Deploy to preview
vercel --prod                 # Deploy to production
```

---

## Success Checklist

- [ ] Code pushed to GitHub
- [ ] Repository is public/accessible
- [ ] Vercel project created and connected
- [ ] Build completes successfully
- [ ] App is accessible via Vercel URL
- [ ] All features work correctly on production

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- GitHub Docs: https://docs.github.com
- Next.js Deployment: https://nextjs.org/docs/deployment

