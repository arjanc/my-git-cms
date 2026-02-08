# Vercel Deployment Without Publishing to npm

## Problem

The `file:../path` protocol doesn't work on Vercel because:
- Vercel only uploads your app directory, not parent directories
- The relative path won't exist on build servers

## Solution: Workspace Monorepo (Vercel-Compatible)

Use npm workspaces but structure it so Vercel can build it.

### Project Structure

```
my-project/
├── packages/
│   └── git-cms/              # The CMS package
│       ├── src/
│       ├── dist/
│       ├── package.json
│       └── tsconfig.json
├── app/                       # Your Next.js app (Vercel root)
│   ├── app/
│   │   ├── admin/
│   │   └── api/
│   ├── package.json
│   ├── next.config.js
│   └── vercel.json           # Important!
├── package.json               # Root workspace config
└── .gitignore
```

### Step-by-Step Setup

#### 1. Root package.json (Workspace)

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "app",
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspace=app",
    "build": "npm run build --workspace=packages/git-cms && npm run build --workspace=app",
    "build:cms": "npm run build --workspace=packages/git-cms",
    "build:app": "npm run build --workspace=app"
  }
}
```

#### 2. App package.json

```json
{
  "name": "my-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^15.1.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@git-cms/core": "*"
  }
}
```

#### 3. CMS Package package.json

```json
{
  "name": "@git-cms/core",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@octokit/rest": "^21.0.2",
    "gray-matter": "^4.0.3"
  },
  "devDependencies": {
    "typescript": "^5.7.2"
  }
}
```

#### 4. Vercel Configuration

**CRITICAL:** Create `app/vercel.json`:

```json
{
  "buildCommand": "cd .. && npm run build",
  "installCommand": "cd .. && npm install",
  "outputDirectory": ".next"
}
```

Or use `vercel.json` at root:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": "app/.next"
}
```

#### 5. .gitignore

```
node_modules/
.next/
dist/
.env.local
.vercel
```

### Development Workflow

```bash
# Install all dependencies
npm install

# Build CMS package
npm run build:cms

# Run app in dev mode
npm run dev

# Build everything for production
npm run build
```

### Vercel Deployment

#### Option A: Deploy from Root

1. **Set root directory in Vercel:**
   - Dashboard → Settings → Build & Development Settings
   - Root Directory: `./` (leave empty or use root)
   - Build Command: `npm run build`
   - Output Directory: `app/.next`

2. **Push to GitHub and deploy**

#### Option B: Deploy from App Directory

1. **Set root directory in Vercel:**
   - Root Directory: `app`
   - Build Command: `cd .. && npm run build`
   - Install Command: `cd .. && npm install`
   - Output Directory: `.next`

2. **Push to GitHub and deploy**

## Alternative: Bundle Package in App

If workspaces are too complex, bundle the built package:

### Structure

```
my-app/
├── app/
├── lib/
│   └── git-cms/              # Copy built package here
│       ├── dist/
│       └── package.json
├── package.json
└── .gitignore
```

### Steps

```bash
# 1. Build package elsewhere
cd /path/to/packages/git-cms
npm run build

# 2. Copy to your app
cd /path/to/my-app
mkdir -p lib/git-cms
cp -r /path/to/packages/git-cms/dist lib/git-cms/
cp /path/to/packages/git-cms/package.json lib/git-cms/

# 3. Update package.json
{
  "dependencies": {
    "@git-cms/core": "file:./lib/git-cms"
  }
}

# 4. Install and commit
npm install
git add lib/
git commit -m "Bundle git-cms package"
git push

# 5. Deploy
vercel
```

### .gitignore

**Don't ignore the bundled package:**

```
node_modules/
.next/
.env.local
# Don't add: lib/git-cms
```

You **commit** `lib/git-cms` to your repo.

## Comparison of Approaches

| Approach | Pros | Cons | Vercel Deployment |
|----------|------|------|-------------------|
| **Workspace Monorepo** | ✅ Clean structure<br>✅ Shared deps<br>✅ Easy local dev | ⚠️ Requires config<br>⚠️ Build complexity | ✅ Works with config |
| **Bundled in App** | ✅ Simple<br>✅ No special config<br>✅ Just works | ❌ Commit built files<br>❌ Manual copy | ✅ Works perfectly |
| **Published to npm** | ✅ Clean<br>✅ Versioned<br>✅ Reusable | ⚠️ Need npm account<br>⚠️ Extra step | ✅ Works perfectly |

## Recommended: Bundled Approach (Until Ready to Publish)

**Why:** It's the simplest and most reliable for Vercel.

### Setup Script

Create `scripts/bundle-cms.sh`:

```bash
#!/bin/bash

# Build the CMS package
cd packages/git-cms
npm install
npm run build

# Copy to app
cd ../../app
mkdir -p lib/git-cms
cp -r ../packages/git-cms/dist lib/git-cms/
cp ../packages/git-cms/package.json lib/git-cms/

echo "✅ CMS package bundled in app/lib/git-cms"
echo "Run: npm install"
```

Make it executable:

```bash
chmod +x scripts/bundle-cms.sh
```

Use before deploying:

```bash
./scripts/bundle-cms.sh
git add lib/
git commit -m "Update bundled CMS"
git push
vercel
```

## When to Use Each Approach

### Use **Workspace Monorepo** if:
- You want clean separation
- You're comfortable with monorepo tooling
- You'll publish to npm eventually
- You have multiple packages

### Use **Bundled Package** if:
- You want simplicity
- You're not ready for monorepo complexity
- You just want it to work on Vercel
- It's a single package

### Use **npm Publishing** if:
- Package is stable
- You want to share it
- You want semantic versioning
- Multiple projects will use it

## Final Recommendation

**For now (before npm publishing):**

1. Use the **bundled approach**
2. Create `app/lib/git-cms/`
3. Copy built package there
4. Commit it to repo
5. Deploy normally to Vercel

**Later (when ready):**

1. Publish to npm
2. Update package.json to use npm version
3. Remove bundled package
4. Deploy

This gives you the fastest path to Vercel deployment without dealing with workspace complexity.
