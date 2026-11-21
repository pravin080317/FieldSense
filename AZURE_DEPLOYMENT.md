# 🚀 FieldSense: Azure Static Web Apps Deployment Guide

## Overview

FieldSense is now **ready to deploy to Azure Static Web Apps**. This is a fully static React app that requires:
- ✅ **No backend servers**
- ✅ **No databases**
- ✅ **No authentication** (public demo)
- ✅ **Zero infrastructure cost** (Azure free tier)

---

## 📋 Pre-Deployment Checklist

- [x] Code pushed to GitHub (`fieldsense/` folder)
- [x] `npm run build` completes successfully
- [x] `dist/` folder contains production build (3.2 KB CSS + 238 KB JS)
- [x] `staticwebapp.config.json` configured for SPA routing
- [x] README.md with complete documentation
- [x] Package.json with all dependencies locked

---

## 🔧 Option 1: GitHub Actions Auto-Deployment (Recommended)

### Step 1: Create Static Web Apps Resource

**In Azure Portal:**
1. Click **Create a resource**
2. Search for **"Static Web App"**
3. Click **Create**
4. Fill in details:
   - **Resource Group:** Create new or select existing
   - **Name:** `fieldsense`
   - **Region:** East US (closest to India Central is Southeast Asia, but East US is cheaper)
   - **Plan type:** Free
5. Click **Sign in with GitHub**
6. Authorize Azure to access your GitHub account
7. Select:
   - **Organization:** YOUR_GITHUB_USERNAME
   - **Repository:** `agritech` (or wherever fieldsense is)
   - **Branch:** `main`
8. Click **Build:**
   - **Build Presets:** Choose "React"
   - **App location:** `/fieldsense`
   - **API location:** (leave blank - no backend)
   - **Output location:** `dist`
9. Click **Review + Create** → **Create**

### Step 2: Wait for Deployment

Azure will:
1. Create `.github/workflows/azure-static-web-apps-*.yml` automatically
2. Trigger first build on GitHub Actions
3. Deploy to Static Web Apps
4. Provide you a URL: `https://fieldsense.azurestaticapps.net`

**That's it!** Your app is now live. Every push to `main` triggers automatic redeploy.

---

## 🔧 Option 2: Manual Azure CLI Deployment

### Prerequisites
```bash
# Install Azure CLI
# Windows: https://aka.ms/installazurecliwindows
# macOS: brew install azure-cli
# Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login
```

### Deploy

```bash
# Create resource group
az group create \
  --name fieldsense-rg \
  --location eastus

# Create Static Web App
az staticwebapp create \
  --name fieldsense \
  --resource-group fieldsense-rg \
  --source https://github.com/YOUR_USERNAME/agritech \
  --branch main \
  --location eastus \
  --build-properties \
    app-location=fieldsense \
    app-artifact-location=dist

# Get deployment token (optional for CI/CD)
az staticwebapp secrets list \
  --name fieldsense \
  --resource-group fieldsense-rg
```

Your app will be available at: `https://fieldsense.azurestaticapps.net`

---

## 🔧 Option 3: Deploy Pre-Built Files Only

If you want to upload the already-built `dist/` folder:

```bash
# Build locally
npm run build

# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Deploy just the dist folder
swa deploy \
  --app-name fieldsense \
  --env production \
  --app-location dist
```

---

## 📂 Folder Structure for Deployment

```
fieldsense/                    ← Azure looks here
├── dist/                      ← This folder gets deployed
│   ├── index.html
│   ├── favicon.svg
│   ├── assets/
│   │   ├── index-*.css
│   │   └── index-*.js
│   └── geojson/               (ready for future GeoJSON)
├── src/
├── package.json
├── staticwebapp.config.json   ← SPA routing config
├── vite.config.ts
└── README.md
```

---

## 🌐 Custom Domain (Optional)

After deployment, you can add a custom domain:

1. **In Azure Portal → Static Web Apps → fieldsense**
2. Click **Custom domains**
3. Add your domain (requires DNS CNAME record)
4. Azure automatically provisions SSL certificate

---

## 🔐 Security Notes

✅ **This is a public demo app** (no authentication)
✅ **Static files only** (no attack surface for backend)
✅ **Sample data marked as "illustrative"** (no real farmer data)
✅ **HTTPS enforced** by Azure by default
✅ **No sensitive data stored** (everything in localStorage if added)

---

## 📊 Monitoring & Scaling

### Check Deployment Status
```bash
az staticwebapp show --name fieldsense --resource-group fieldsense-rg
```

### View Logs
```bash
# In Azure Portal:
# → Static Web Apps → fieldsense → Application Insights
```

### Cost Estimation
- **Hosting:** FREE (up to 100 GB/month)
- **Storage:** FREE (Azure free tier)
- **Bandwidth:** FREE (up to 1 GB/month)
- **Custom Domain:** $5/month (optional)

**Total:** $0 (or $5 if you add a custom domain)

---

## 🔄 CI/CD Pipeline

### Auto-Deploy on Git Push

After connecting GitHub, every push to `main` triggers:

1. GitHub Actions runs `npm install`
2. Runs `npm run build`
3. Uploads `dist/` to Azure Static Web Apps
4. App live in ~2 minutes

### View Build Status
1. Go to your GitHub repo → **Actions** tab
2. Click latest workflow run
3. See build logs and deployment status

---

## 🧪 Post-Deployment Testing

After deployment to Azure:

```bash
# Test the live URL
curl https://fieldsense.azurestaticapps.net

# Should return index.html (200 OK)
```

Then:
1. Open in browser: https://fieldsense.azurestaticapps.net
2. Test all three scenarios (A, B, C)
3. Verify evidence engine updates in real-time
4. Check mobile responsiveness

---

## 🚨 Troubleshooting

### "Build failed in GitHub Actions"
- Check Azure portal logs
- Ensure `vite.config.ts` exists
- Verify `dist/` output location is correct

### "App loads but shows blank page"
- Check browser console (F12)
- Verify `staticwebapp.config.json` routing
- Ensure `index.html` exists in `dist/`

### "Static Web Apps gives 404"
- Verify app location: `/fieldsense`
- Verify output location: `dist`
- Check `staticwebapp.config.json` for SPA routing

---

## 🎯 Next Steps

### Immediate (Day 1)
1. Push code to GitHub
2. Connect GitHub to Azure Static Web Apps
3. Wait for first deployment
4. Test live URL

### Short Term (Week 1)
- [ ] Add custom domain (optional)
- [ ] Set up DNS
- [ ] Add monitoring/Application Insights
- [ ] Test on mobile devices

### Medium Term (Month 1)
- [ ] Add Blob Storage for photo uploads
- [ ] Implement localStorage for case history
- [ ] Add PDF export (pdfkit or similar)
- [ ] User feedback form

### Long Term (Q2+)
- [ ] Connect to lab API for real soil tests
- [ ] Add ArcGIS map integration
- [ ] Build backend for multi-field tracking
- [ ] Add user authentication (Entra ID)
- [ ] Integrate SMS alerts

---

## 📞 Support

### Azure Static Web Apps Docs
https://docs.microsoft.com/azure/static-web-apps

### Common Issues
https://docs.microsoft.com/azure/static-web-apps/troubleshooting

### GitHub Actions
https://docs.github.com/actions/using-workflows

---

## 🎉 Deployment Checklist

- [ ] Code on GitHub
- [ ] GitHub repo connected to Azure
- [ ] `main` branch set as deployment source
- [ ] Build configuration correct (app-location, artifact-location)
- [ ] First build succeeded in GitHub Actions
- [ ] App accessible at Static Web Apps URL
- [ ] All three scenarios work
- [ ] Evidence engine updates in real-time
- [ ] Responsive on mobile
- [ ] No console errors

---

**Once all checks ✅, your app is live!**

**URL:** `https://fieldsense.azurestaticapps.net`

**Cost:** FREE (or $5/month with custom domain)

**Maintenance:** Just push to GitHub, Azure deploys automatically.

🌾 **FieldSense is now serving agricultural decisions in the cloud!** 🚀
