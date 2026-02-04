# Complete Setup Guide

## Prerequisites

- Node.js 18+ installed
- GitHub account
- Git installed
- Code editor (VS Code recommended)

## Step-by-Step Setup

### Part 1: GitHub OAuth Configuration

1. **Create GitHub OAuth App**
   - Go to https://github.com/settings/developers
   - Click "New OAuth App"
   - Fill in the form:
     ```
     Application name: My Git CMS
     Homepage URL: http://localhost:3000
     Authorization callback URL: http://localhost:3000/api/auth/callback/github
     ```
   - Click "Register application"
   - **Copy the Client ID**
   - Click "Generate a new client secret" and **copy the secret**

### Part 2: Create a Content Repository

1. **Create a new GitHub repository** for your content
   - Name it something like `my-website-content`
   - Make it public or private (your choice)
   - Initialize with a README

2. **Create the content directory structure**
   ```bash
   git clone https://github.com/YOUR_USERNAME/my-website-content.git
   cd my-website-content
   mkdir -p content/pages
   git add .
   git commit -m "Add content directory"
   git push
   ```

### Part 3: CMS App Setup

1. **Install dependencies**
   ```bash
   cd cms-app
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

3. **Edit `.env.local`** with your values:
   ```env
   AUTH_GITHUB_ID=your_github_client_id_here
   AUTH_GITHUB_SECRET=your_github_client_secret_here
   AUTH_SECRET=generate_with_openssl_rand_base64_32
   ```

4. **Generate NextAuth secret**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste it as the `AUTH_SECRET` value.

5. **Start the CMS**
   ```bash
   npm run dev
   ```

6. **Test the CMS**
   - Open http://localhost:3000
   - Click "Sign in with GitHub"
   - Authorize the application
   - Select your content repository
   - Create a test page

### Part 4: Web App Setup

1. **Clone your content repository into the web app**
   ```bash
   cd web-app
   git clone https://github.com/YOUR_USERNAME/my-website-content.git content
   ```

   Or if you prefer to use Git submodules:
   ```bash
   cd web-app
   git submodule add https://github.com/YOUR_USERNAME/my-website-content.git content
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the web app**
   ```bash
   npm run dev
   ```

4. **View your site**
   - Open http://localhost:3001
   - You should see your pages rendered

### Part 5: Deployment to Vercel

#### Deploy CMS App

1. **Push your CMS code to GitHub**
   ```bash
   cd cms-app
   git init
   git add .
   git commit -m "Initial CMS setup"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/my-git-cms.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

3. **Configure environment variables in Vercel**
   - Go to your project settings in Vercel dashboard
   - Add the same environment variables from `.env.local`
   - Variables needed: `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`

4. **Update GitHub OAuth App**
   - Go back to GitHub OAuth settings
   - Update the Authorization callback URL to:
     ```
     https://your-cms-domain.vercel.app/api/auth/callback/github
     ```

#### Deploy Web App

1. **Push your web app code to GitHub**
   ```bash
   cd web-app
   git init
   git add .
   git commit -m "Initial web app setup"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/my-website.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

3. **Configure Vercel to watch content changes**
   - In Vercel dashboard, go to project settings
   - Add GitHub webhook for your content repository
   - This will trigger rebuilds when content changes

### Part 6: Configure Auto-Rebuild

To automatically rebuild your website when content changes:

1. **Set up Vercel Deploy Hook**
   - Go to your web app project in Vercel
   - Settings > Git > Deploy Hooks
   - Create a new hook (name it "Content Update")
   - Copy the webhook URL

2. **Add webhook to content repository**
   - Go to your content repository on GitHub
   - Settings > Webhooks > Add webhook
   - Paste the Vercel deploy hook URL
   - Content type: `application/json`
   - Events: Choose "Just the push event"
   - Click "Add webhook"

Now whenever you save content in the CMS:
1. CMS commits changes to GitHub
2. GitHub triggers Vercel webhook
3. Vercel rebuilds your website
4. Changes are live in ~1 minute

## Troubleshooting

### Issue: "OAuth Error" when signing in

**Solution:**
- Check that your `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct
- Verify the callback URL in GitHub OAuth app settings matches your `NEXTAUTH_URL`

### Issue: "Repository not found"

**Solution:**
- Ensure your GitHub user has access to the repository
- Check that the OAuth app has `repo` scope permission

### Issue: "Cannot save file"

**Solution:**
- Verify your GitHub token has write permissions
- Check that the content directory exists in your repository

### Issue: Page not showing on website

**Solution:**
- Ensure the markdown file is in `content/pages/` directory
- Check that the slug in frontmatter is correct
- Verify the file has been committed to the repository
- Try rebuilding the web app: `npm run build && npm run start`

## Next Steps

1. **Customize your blocks** - Add new block types or modify existing ones
2. **Style your website** - Customize Tailwind theme and component styles
3. **Add features** - Image uploads, SEO settings, draft mode, etc.
4. **Create templates** - Predefined page templates for common layouts
5. **Multi-language** - Add i18n support for multiple languages

## File Structure Reference

```
cms-app/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── blocks/          # Block editor components
│   │   ├── editors/     # Individual block editors
│   │   └── BlockEditor.tsx
│   └── PageEditor.tsx   # Main page editor
├── pages/
│   ├── api/
│   │   ├── auth/        # NextAuth configuration
│   │   ├── repos.ts     # List user repos
│   │   └── github/      # GitHub API routes
│   ├── editor/          # Editor pages
│   └── index.tsx        # Dashboard
├── lib/
│   ├── github-api.ts    # GitHub API wrapper
│   └── utils.ts         # Utility functions
└── styles/
    └── globals.css      # Global styles

web-app/
├── components/
│   └── blocks/          # Block renderer components
│       ├── Hero.tsx
│       ├── USP.tsx
│       └── BlockRenderer.tsx
├── pages/
│   └── [...slug].tsx    # Dynamic page routing
└── content/
    └── pages/           # Markdown content files

shared/
├── block-types.ts       # Block type definitions
└── markdown-utils.ts    # Markdown parsing utilities
```

## Tips for Development

1. **Hot Reload**: Both apps support hot reload - changes appear instantly
2. **TypeScript**: Use TypeScript for better DX and fewer bugs
3. **Testing**: Test your blocks in both the editor and the rendered website
4. **Version Control**: Commit your CMS app and web app separately
5. **Content Backups**: Your content is in Git - full version history!
