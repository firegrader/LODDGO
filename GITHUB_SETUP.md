# GitHub Setup Guide for LODDGO

## ✅ Already Done Automatically

- ✅ Git repository initialized
- ✅ Initial commit created (M0-M2 complete)
- ✅ Branch renamed to `main`
- ✅ `.gitignore` configured (excludes `.env.local`, `node_modules`, etc.)

## 🔧 What You Need to Do Manually

### Step 1: Create GitHub Repository

1. Go to: **https://github.com/new**
2. Repository name: `LODDGO` (or your preferred name)
3. **Important**: Leave it **empty** (don't check "Add README", "Add .gitignore", or "Choose a license")
4. Click **"Create repository"**

### Step 2: Connect Local Repo to GitHub

**Option A: Use the setup script (Easiest)**
```powershell
.\setup-github.ps1
```
Follow the prompts, then run `git push -u origin main` after creating the repo.

**Option B: Manual commands**
```powershell
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/LODDGO.git
git push -u origin main
```

**Option C: If you already created the repo**
Just run:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/LODDGO.git
git push -u origin main
```

## 🚀 Daily Workflow (Desktop ↔ Laptop)

### Before Starting Work (on either machine):
```powershell
git pull          # Get latest changes
npm install       # Only if package.json changed
```

### After Making Changes:
```powershell
git add .
git commit -m "Description of your changes"
git push
```

### First Time on Laptop:
```powershell
cd C:\dev
git clone https://github.com/YOUR_USERNAME/LODDGO.git
cd LODDGO
npm install

# Create .env.local with your Supabase credentials
# (Copy from desktop or set up fresh)
```

## 📝 Important Notes

1. **Environment Variables**: `.env.local` is already ignored by Git. You need to create it on each machine separately with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ADMIN_KEY=your_admin_key
   ```

2. **Database**: You can use the same Supabase project from both machines, or set up separate ones.

3. **Conflicts**: If you get conflicts when pulling:
   ```powershell
   git pull                    # Shows conflicts
   # Edit conflicted files
   git add .
   git commit -m "Resolved conflicts"
   git push
   ```

## 🎯 Quick Commands Reference

```powershell
git status              # See what changed
git log --oneline       # View commit history
git diff                # See changes before committing
git pull                # Get latest from GitHub
git push                # Send changes to GitHub
```

## ✅ Verification

After setup, verify everything works:
```powershell
git remote -v           # Should show your GitHub URL
git log                 # Should show your initial commit
```

---

**Your Git Config:**
- Username: `firegrader`
- Email: `ricardo@firegrader.com`

If your GitHub username is different, use that in the remote URL instead.
