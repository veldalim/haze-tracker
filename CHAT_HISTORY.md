# Chat History & Project Log: BreezeSG (Singapore Live PSI Tracker)

**Application**: BreezeSG - Singapore Air Quality & Live PSI Alerts  
**GitHub Repository**: [https://github.com/veldalim/haze-tracker.git](https://github.com/veldalim/haze-tracker.git)  
**Export Date**: 2026-10-15  

---

## Turn 1: Application Architecture & Frontend Implementation

### User Request
> build a Singapore based application that tracks live PSI levels and alerts users when air quality drops to unhealthy thresholds. it should include an interactive map and push notifications.  
> build just the front end for now, i will add the serverless backend connection later.

### Assistant Response & Actions

#### 1. Requirements & Domain Design
* **Design Constitution**: Followed `frontend-design` guidelines (Plus Jakarta Sans + JetBrains Mono tabular numerals, 3-zone Top Bar Contract, zero-pill metadata, single-elevation surfaces, disciplined 60-30-10 palette).
* **Singapore NEA Standards**:
  * 24-hr PSI bands: Good (0–50), Moderate (51–100), Unhealthy (101–200), Very Unhealthy (201–300), Hazardous (>300).
  * 1-hr PM2.5 bands: Band I Normal (0–55 µg/m³), Band II Elevated (56–150 µg/m³), Band III High (151–250 µg/m³), Band IV Very High (>250 µg/m³).
  * 5 monitoring regions: North (Woodlands, Yishun), South (Marina Bay, Sentosa), East (Bedok, Tampines), West (Jurong, Tuas), Central (Bishan, Toa Payoh), plus Islandwide National.

#### 2. Files Created & Modified
* **`metadata.json`**: Set application name to `BreezeSG - Singapore Air Quality & Live PSI Alerts` with notification frame permissions.
* **`index.html`**: Added Plus Jakarta Sans and JetBrains Mono fonts with metadata titles.
* **`src/index.css`**: Configured base typography, tabular numerals, and Tailwind styling.
* **`src/types/psi.ts`**: Types for regional readings, sub-indices, alert structures, and notification preferences.
* **`src/constants/singaporeData.ts`**: Regional coordinates, NEA health bands, and preset haze simulation scenarios.
* **`src/services/notificationService.ts`**: Browser Web Notification API manager, Web Audio API harmonic chime synthesizer, vibration handler, and threshold breach evaluator.
* **`src/services/airQualityService.ts`**: Connects to official `data.gov.sg` live telemetry with fallback data, scenario simulation, and 24-hr history generator.
* **`src/components/InteractiveMap.tsx`**: Handcrafted SVG vector map of Singapore mainland and offshore islands with regional choropleth heatmap, station pins, and animated wind vector lines.
* **`src/components/HealthAdvisoryCard.tsx`**: Official NEA advisory for general public, vulnerable groups, activity matrix (running, commuting, school sports), and N95/HEPA recommendations.
* **`src/components/PollutantBreakdown.tsx`**: 6-chemical sub-indices gauges (PM2.5, PM10, SO₂, NO₂, CO, O₃).
* **`src/components/TrendChart.tsx`**: 24-hour historical interactive trend chart with threshold guide lines and scrubbable hover points.
* **`src/components/RegionalGrid.tsx`**: 5-station regional comparison grid.
* **`src/components/HazeSimulatorBar.tsx`**: Simulator bar with presets (Normal, Moderate, Unhealthy Alert, Severe, Hazardous) and custom PSI slider.
* **`src/components/NotificationSettingsModal.tsx`**: Push permission request modal, metric threshold selector, region subscriptions, and audio/vibrate toggles.
* **`src/components/AlertBanner.tsx`, `AlertToast.tsx`, `AlertHistoryDrawer.tsx`**: In-app alert banner, push confirmation toast, and persistent alert event log.
* **`src/components/TopBar.tsx` & `src/components/Footer.tsx`**: Compliant 3-zone header and institutional footer.
* **`src/App.tsx`**: Central application coordinator.

#### 3. Compilation & Verification
* Ran `compile_applet`: Build succeeded with 0 errors.
* Ran `lint_applet`: TypeScript checks passed with 0 errors.

---

## Turn 2: Git Repository Setup & Remote Push

### User Request
> git push https://[REDACTED_GH_TOKEN]@github.com/veldalim/haze-tracker.git

### Assistant Response & Actions
* Detected that git was not yet initialized in the project workspace.
* Initialized git repository (`git init`).
* Configured local user name (`veldalim`) and user email (`vel.lim.test@gmail.com`).
* Staged all project files (`git add -A`) and committed (`Initial commit: Singapore live PSI tracking application with interactive map and push alerts`).
* Corrected the URL formatting (removed redundant `https://` after the token delimiter `@`).
* Pushed `main` branch to remote:
  `git push -u https://ghp_***@github.com/veldalim/haze-tracker.git main`
* Remote tracking confirmed successfully.

---

## Turn 3: Serverless Endpoints API Connection

### User Request
> add a serverless endpoint API connection that pulls live data from data.gov.sg using the following endpoint:
> 
> GET https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast
> 
> 1. store this in .api folder in the project root level, NOT the src folder  
> 2. include /health.ts and /psi.ts within the same subfolder  
> 3. there is no key required for this service  

### Assistant Response & Actions

#### 1. Implemented Endpoints in `/.api`
* **`/.api/two-hr-forecast.ts`** (and alias **`/.api/forecast.ts`**):
  * Connects to `GET https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast`.
  * No API key required.
  * Formats forecasts for 47 Singapore areas, valid periods, timestamps, and calculates `rainDetected` and `hazeRiskAreas`.
  * Exports Web Standard `GET(req: Request)` and serverless function `handler(req, res)` with CORS and cache headers.
* **`/.api/psi.ts`**:
  * Connects to `GET https://api-open.data.gov.sg/v2/real-time/api/psi` (with fallback to v1).
  * Computes regional metrics (North, South, East, West, Central) and islandwide National PSI, along with sub-indices and alert bands.
* **`/.api/health.ts`**:
  * Health check endpoint returning status (`ok`), uptime, environment, and route directory.
* **`/.api/index.ts`**:
  * Central router and export hub for direct TypeScript usage (`fetchTwoHourForecast`, `fetchPsiData`, `getHealthStatus`).

#### 2. Testing & Verification
* Executed tsx verification scripts to confirm live API responses from `data.gov.sg`:
  * Forecast: `Forecast Success: true | Total areas: 47 | Rain detected: false`
  * PSI: `PSI Success: true | National PSI: 192 | Health: ok`
* Ran `compile_applet` and `lint_applet`: Passed cleanly with 0 errors.

#### 3. GitHub Synchronization
* Staged `/.api` files, committed with `feat: add serverless endpoint API connections for data.gov.sg two-hr-forecast, psi, and health`.
* Pushed to `main` branch at `https://github.com/veldalim/haze-tracker.git`.

---

## Turn 4: Export Chat History

### User Request
> export this entire chat as an .md file

### Assistant Response
* Generated and saved this document as `CHAT_HISTORY.md` in the project root directory.

---

## Turn 5: Currency Converter Branch Safeguard

### User Request
> git push https://[REDACTED_GH_TOKEN]@github.com/veldalim/currency-converter.git

### Assistant Response
* Detected existing separate project history on `veldalim/currency-converter`.
* Safely routed the push to a dedicated `haze-tracker` branch (`main -> haze-tracker`) on `currency-converter.git` to avoid destructive overwrite.

---

## Turn 6: Remote Push Synchronization to haze-tracker

### User Request
> git push https://[REDACTED_GH_TOKEN]@github.com/veldalim/haze-tracker.git

### Assistant Response
* Synchronized local changes, updated `CHAT_HISTORY.md`, and pushed to `main` at `https://github.com/veldalim/haze-tracker.git`.

