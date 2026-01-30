# Workout Tracker - Project Plan

## Project Status
**Live:** https://1ndu5.github.io/personal-projects/workout-tracker/
**Tech:** React 19 + Vite 7 + Tailwind CSS 4 + PWA
**Deployed:** GitHub Pages (monorepo)

## Core Concepts
- **Multiple activity types:** Cardio, Weights, Hockey, Other (free-text)
- **Flexible logging:** Multiple workouts per day, each with specific details
- **Routine-based weights:** Save and reuse weight training routines
- **Calendar overview:** Visual activity indicators on calendar
- **Local-first:** All data in browser localStorage, fully client-side

## Key Decisions & Rationale

### React + Vite (modern stack)
- Component-based architecture for complex forms
- Fast development and hot module replacement
- Trade-off: Requires build step, but essential for maintainability

### Tailwind CSS 4 (vs custom CSS)
- Rapid UI development with utility classes
- Consistent design system out of the box
- Smaller bundle size than traditional CSS frameworks
- Trade-off: Longer className strings, but faster iteration

### localStorage (vs IndexedDB/server)
- Simpler API than IndexedDB for structured data
- Sufficient storage for workout logs
- No backend costs or privacy concerns
- Trade-off: Device-only data, mitigated by Export/Import

### UUID-based IDs (vs auto-increment)
- Unique identifiers prevent conflicts
- Enables future sync capabilities
- Better for export/import scenarios
- Trade-off: Slightly larger IDs, but more flexible

### PWA (Progressive Web App)
- Offline caching via service worker
- Installable on iOS/Android
- Auto-updates on new deployments
- WARNING: Clearing browser data deletes workouts + cache

### Deployment: Local Build + Commit dist/
- Build locally, commit dist/ to git
- GitHub Actions deploys pre-built files
- Trade-off: Manual build step, but reliable and fast
- Workflow: edit src/ → `npm run build` → `git add -f dist/` → commit → push

## Data Model

### Workout Schema
```js
{
  id: "uuid-v4",              // Unique identifier
  date: "2026-01-27",         // YYYY-MM-DD
  type: "cardio|weights|hockey|other",
  createdAt: timestamp,
  data: {
    // Cardio-specific:
    activityType: "Running",
    duration: 30,             // minutes
    intensity: "Moderate",
    notes: "..."

    // Weights-specific:
    routineName: "Push Day",
    exercises: [
      {
        name: "Bench Press",
        sets: [
          { reps: 10, weight: 135, unit: "lbs" }
        ]
      }
    ]

    // Hockey/Other:
    description: "Free text..."
  }
}
```

### Routine Schema (for weights)
```js
{
  id: "uuid-v4",
  name: "Push Day",
  exercises: [
    { name: "Bench Press" },
    { name: "Overhead Press" }
  ],
  createdAt: timestamp
}
```

### Settings Schema
```js
{
  primaryActivity: "cardio|weights|hockey|other|null"
  // null = show all as dots
  // specific type = highlight that type in calendar
}
```

## Features

**Activity Types:**
- **Cardio:** Activity type, duration, intensity, notes
- **Weights:** Routine-based with exercises, sets, reps, weight
- **Hockey:** Free-text description
- **Other:** Free-text description

**Weights Routine Manager:**
- Save routines with exercise templates
- Load routine when logging weights
- Quick logging by filling in sets/reps/weight
- Edit/delete saved routines

**Calendar:**
- Month view with workout indicators
- Dots show which activities logged each day
- Optional: Highlight primary activity (set in settings)
- Click any day to view/edit workouts

**Day Detail:**
- View all workouts for a day
- Add multiple workouts per day
- Edit existing workouts
- Delete workouts with confirmation

**Settings:**
- Primary activity selector (highlights that type in calendar)
- Export all data (JSON format)
- Import data (merges with existing)
- Clear all data (with confirmation)

## File Structure
```
src/
  components/  # Calendar, DayDetail, CardioForm, WeightsForm, FreeTextForm,
               # RoutineManager, RoutineForm, Settings
  hooks/       # useLocalStorage (generic localStorage hook)
  utils/       # storage (workout/routine CRUD), dateUtils (date formatting)
dist/          # COMMITTED TO GIT (built files)
```

## Development Workflow
1. Edit `src/`
2. Test: `npm run dev` (localhost:5173)
3. Build: `npm run build`
4. Commit: `git add src/ && git add -f dist/`
5. Push (VS Code or CLI)
6. GitHub Actions deploys

## Known Limitations
- **No cross-device sync** → Export/Import for manual transfer
- **PWA data clearing** → Export regularly as backup!
- **No workout history charts** → View by calendar only
- **No rep/weight tracking over time** → Manual comparison
- **Single user** → No multi-user support

## Future Ideas (User-Approved)
1. **Cloud backup/sync** - Auto-backup to cloud, cross-device sync
2. **Weekly goals** - Set weekly targets, track progress toward goals

## Changelog
**v1.0 (2026-01-XX)** - Initial release with cardio, weights, hockey, other types, routine manager, export/import, PWA support

## Context for LLMs
Built with Claude AI through iterative development. Started as simple workout logger, evolved to include routine management for weights and multiple activity types. Deployment strategy matches journal app: local build + commit dist/ after GitHub Actions build attempts failed. Prioritized simplicity, privacy, and offline-first design. Tailwind CSS chosen for rapid UI development compared to custom CSS approach in journal app.
