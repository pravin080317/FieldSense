# 🌾 FieldSense - Quick Start Index

> **Agricultural Decision Support System | Evidence-Based Field Monitoring**

---

## 🚀 TL;DR - Get It Running in 2 Minutes

```bash
cd fieldsense
npm install          # (already done)
npm run dev
# → Opens http://localhost:5173 automatically
```

**That's it!** You can now:
- Select Scenario A, B, or C
- See instant evidence analysis
- Watch the Decision Engine work in real-time
- Try all three hypotheses

---

## 📚 Documentation Guide

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **README.md** | Complete feature guide, architecture, tech stack | 15 min |
| **AZURE_DEPLOYMENT.md** | Step-by-step Azure deployment | 10 min |
| **BUILD_SUMMARY.md** | Build details, file structure, verification | 8 min |
| **COMPLETE_GUIDE.md** | Full reference, data flows, component breakdown | 20 min |
| **THIS FILE** | Quick reference & navigation | 5 min |

**Start here:** README.md → Pick your next doc based on your goal

---

## 🎯 Choose Your Path

### Path 1: "I want to see it work locally"
1. `npm run dev`
2. Try scenarios A, B, C
3. Watch evidence update in real-time
4. **Docs:** README.md (Features section)

### Path 2: "I want to deploy to Azure"
1. Push code to GitHub
2. Follow AZURE_DEPLOYMENT.md
3. Connect Azure Static Web Apps
4. Auto-deploy on git push
5. **Result:** Live at `https://fieldsense.azurestaticapps.net`

### Path 3: "I want to understand the code"
1. Read BUILD_SUMMARY.md (file structure)
2. Read src/types/domain.ts (data model)
3. Read src/services/EvidenceEngine.ts (rules)
4. Read COMPLETE_GUIDE.md (data flows)

### Path 4: "I want to extend/modify it"
1. COMPLETE_GUIDE.md (architecture)
2. src/App.tsx (UI structure)
3. src/data/sampleData.ts (sample scenarios)
4. src/services/EvidenceEngine.ts (modify rules)
5. README.md (Limitations section for ideas)

---

## 🧪 Three Demo Scenarios

### Scenario A: 🌊 Waterlogging
**What farmers see:** Yellow leaves in a low patch after rain, wet soil
**What the app shows:** HIGH confidence in waterlogging
**Evidence:** Waterlogged soil + yellowing leaves
**Missing:** Water depth test

### Scenario B: 🌱 Nutrient Stress
**What farmers see:** Yellow leaves across the field
**What the app shows:** HIGH confidence in nitrogen deficiency
**Evidence:** Low N soil test (220 ppm) + lower leaf yellowing
**Missing:** None critical

### Scenario C: 🐛 Disease/Pest
**What farmers see:** Brown leaves with pest damage at 2 points
**What the app shows:** MEDIUM confidence (needs lab)
**Evidence:** Pest counts (6-8 per point) + leaf damage
**Missing:** Lab identification of pest species

---

## 🎨 App Layout

```
┌────────────────────────────────────────────┐
│          HEADER: FieldSense 🌾             │
│     Salem | Illustrative Data          │
└────────────────────────────────────────────┘
┌────────────────────────────────────────────┐
│   SCENARIO SELECTOR: [A] [B] [C]           │
└────────────────────────────────────────────┘
┌────────────────────────────────────────────┐
│   FIELD INFO: Name | Crop | Area | Season  │
└────────────────────────────────────────────┘
┌──────────────┬──────────────┬──────────────┐
│Observations  │ Test Results │Missing Evid. │
│              │              │              │
│Point 1: ...  │Soil Test:    │- Water test  │
│Point 2: ...  │N:420, P:32   │- Lab confir. │
│Point 3: ...  │K:280, pH:6.8 │              │
│Point 4: ...  │Water: none   │              │
└──────────────┴──────────────┴──────────────┘
┌──────────────┬──────────────┬──────────────┐
│Waterlogging  │Nutrient Str. │Disease/Pest  │
│HIGH ✅       │MEDIUM ⚠️     │LOW 🔍        │
│              │              │              │
│✓ Supporting  │✓ Supporting  │✓ Supporting  │
│✗ Weakening   │✗ Weakening   │✗ Weakening   │
│? Missing     │? Missing     │? Missing     │
│              │              │              │
│Next Check:   │Next Check:   │Next Check:   │
│Root excavate │Tissue analysis│Pest ID lab  │
└──────────────┴──────────────┴──────────────┘
┌────────────────────────────────────────────┐
│       PLAIN-LANGUAGE SUMMARY                │
│ Strong evidence suggests: Waterlogging     │
│ Possible issues: Nutrient stress           │
│ Missing: Recent water test, Lab data       │
└────────────────────────────────────────────┘
```

---

## 💾 Key Files at a Glance

### Application Logic
- **App.tsx** (12.9 KB) — Main React component, state management, UI rendering
- **EvidenceEngine.ts** (9.75 KB) — Deterministic rules, confidence scoring
- **domain.ts** (3.75 KB) — TypeScript interfaces for all data types
- **sampleData.ts** (7.6 KB) — Three complete scenarios with realistic observations

### Configuration
- **vite.config.ts** — Build configuration
- **tailwind.config.js** — Tailwind CSS setup
- **postcss.config.js** — PostCSS plugin configuration
- **staticwebapp.config.json** — Azure SPA routing (redirects 404 to index.html)

### Documentation
- **README.md** (11.8 KB) — Complete feature guide
- **AZURE_DEPLOYMENT.md** (7.78 KB) — Deployment steps
- **BUILD_SUMMARY.md** (7.38 KB) — Build details
- **COMPLETE_GUIDE.md** (13.4 KB) — Full reference
- **THIS FILE** — Quick navigation

---

## 🔧 Commands Reference

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev
# → http://localhost:5173 (HMR enabled)

# Production build
npm run build
# → Creates dist/ folder (~242 KB)

# Preview production build
npm run preview
# → Runs dist/ locally for testing

# Type checking only
npx tsc --noEmit

# Linting
npm run lint
```

---

## 📊 Evidence Engine Rules (Simplified)

### Rule 1: Waterlogging
```
Score = 0
If soil waterlogged: score += 1
If water test shows standing water: score += 1
If leaves yellowing: score += 1

Confidence = (score >= 2) ? 'high' : (score == 1) ? 'medium' : 'low'
```

### Rule 2: Nutrient Stress
```
Score = 0
If soil N < 300 ppm: score += 1
If lower leaves yellowing: score += 1

Confidence = (score >= 2) ? 'high' : (score == 1) ? 'medium' : 'low'
```

### Rule 3: Disease/Pest
```
Score = 0
If pest count > 0 at multiple points: score += 1
If leaf browning or spot damage: score += 1

Confidence = (score >= 2) ? 'medium' : 'low'
(Never 'high' — needs lab confirmation)
```

---

## 🌐 Deployment Checklist

- [ ] **Local Testing:** `npm run dev` → Test all 3 scenarios
- [ ] **Mobile Check:** Resize browser to verify responsive layout
- [ ] **Build Check:** `npm run build` → No errors
- [ ] **Code to GitHub:** Push to your repo
- [ ] **Azure Setup:** Create Static Web Apps resource (see AZURE_DEPLOYMENT.md)
- [ ] **Connect:** Link GitHub repo to Azure
- [ ] **Auto-Deploy:** Push triggers build & deploy automatically
- [ ] **Verify:** Test live URL `https://fieldsense.azurestaticapps.net`

---

## 🚀 After Deployment

### Monitor
- Azure Portal → Static Web Apps → fieldsense → Application Insights

### Update Code
- Make changes locally
- Commit to GitHub `main` branch
- Automatic redeploy in ~2 minutes

### Add Domain
- Azure Portal → Static Web Apps → Custom domains
- Add your domain (requires DNS CNAME)
- SSL certificate auto-provisioned

---

## 🤔 Common Questions

**Q: Can I add more scenarios?**
A: Yes! Edit `src/data/sampleData.ts`, add new scenario object, update scenario selector in App.tsx

**Q: Can I change the rules?**
A: Yes! Edit `src/services/EvidenceEngine.ts`, modify checkWaterlogging() / checkNutrientStress() / checkDiseaseRisk()

**Q: Can I add photo upload?**
A: Yes, but requires backend. Would need Azure Blob Storage + API

**Q: Can I add real soil lab data?**
A: Yes! Replace sample data with API calls to lab system

**Q: Does it work offline?**
A: Yes! All data is embedded, no API calls needed

**Q: Can I add authentication?**
A: Yes! Use Azure Entra ID or other auth provider (out of scope for demo)

---

## 📞 Getting Help

### Azure Static Web Apps Issues
→ https://docs.microsoft.com/azure/static-web-apps

### React/TypeScript/Tailwind
→ Check respective documentation + Stack Overflow

### Project-Specific Questions
→ See README.md, AZURE_DEPLOYMENT.md, or COMPLETE_GUIDE.md

---

## 🎯 Success Metrics

✅ App runs locally without errors
✅ All three scenarios work correctly
✅ Evidence updates in real-time when scenario changes
✅ Mobile layout is responsive
✅ Builds to production without warnings
✅ Deployed to Azure and accessible via URL
✅ Auto-deploy works (push to GitHub = deploy to Azure)

---

## 📈 Project Stats

| Metric | Value |
|--------|-------|
| **Tech Stack** | React 18 + TS + Vite + Tailwind |
| **Components** | 1 main (App.tsx) |
| **Domain Types** | 11 TypeScript interfaces |
| **Rules/Hypotheses** | 3 (Waterlogging, Nutrients, Disease) |
| **Scenarios** | 3 (A, B, C) |
| **Scouting Points** | 4 per field |
| **Build Time** | 3.26 seconds |
| **Bundle Size** | 238 KB JS + 3.2 KB CSS |
| **Hosting Cost** | FREE (Azure free tier) |
| **Time to Deploy** | ~5 minutes (GitHub + Azure setup) |

---

## 🎓 Learning Resources in This Project

1. **TypeScript** — Strict domain modeling
2. **React** — State management with hooks
3. **Vite** — Fast build tooling
4. **Tailwind CSS** — Responsive utility-first design
5. **Static SPA** — Hosting without backend
6. **Azure Static Web Apps** — Deployment automation
7. **Decision Engines** — Transparent rule-based reasoning
8. **Agricultural Tech** — Real-world domain example

---

## 🌾 Final Thoughts

FieldSense demonstrates that **good agricultural decision support doesn't require complex AI or black boxes**. 

Simple, deterministic rules applied to farmer observations + lab tests can generate valuable insights with full transparency.

**Every conclusion is traceable to dated evidence. Change an observation, all analyses update instantly.**

That's the promise. That's what this app delivers.

---

**Next Step:** Choose your path above and get started! 🚀

**Questions?** Check the full docs:
- README.md (features & architecture)
- AZURE_DEPLOYMENT.md (deployment)
- COMPLETE_GUIDE.md (reference)
