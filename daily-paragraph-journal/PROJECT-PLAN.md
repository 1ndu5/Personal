# Daily Paragraph Journal - Project Plan

## Project Status
**Live:** https://1ndu5.github.io/personal-projects/daily-paragraph-journal/
**Tech:** React 19 + Vite 7 + IndexedDB + PWA
**Deployed:** GitHub Pages (monorepo)

## Core Concepts
- **Noon-to-noon boundaries:** Before noon = writing about yesterday, after noon = today
- **Year-agnostic memories:** Calendar/memories ignore years, show month+day only
- **300 char limit:** One focused paragraph per day
- **Local-first:** All data in browser IndexedDB, fully client-side

## Key Decisions & Rationale

### React + Vite (vs vanilla JS)
- Better code organization via components
- Fast development with Vite
- Trade-off: Requires build step, but worth it for maintainability

### IndexedDB (vs localStorage/server)
- More storage capacity than localStorage
- No backend costs or privacy concerns  
- Trade-off: Device-only data, mitigated by Export/Import

### CSS Variables for Themes (vs React Context)
- Better performance (no re-renders)
- Simpler implementation
- 3 themes: Vintage (default), Autumn Leaves, Midnight Scholar

### PWA (added v1.1)
- Offline caching via service worker
- Installable on iOS/Android
- Auto-updates
- WARNING: Clearing browser data deletes entries + cache

### Deployment: Local Build + Commit dist/
- Initially tried GitHub Actions automated builds → path issues
- Solution: Build locally, commit dist/ to git
- Trade-off: Manual step, but reliable and fast
- Workflow: edit src/ → `npm run build` → `git add -f dist/` → commit → push

## Data Model
```js
{
  journalDay: "2026-01-27",  // PK (YYYY-MM-DD)
  text: "Entry...",          // max 300 chars
  createdAt: timestamp,
  year: 2026, month: 1, day: 27  // for queries
}
```
Index: [month, day] for "this day in history"

## Features

**Entry Form:**
- 300 char limit with live counter
- Only today editable (past locked)
- Shows "writing about today/yesterday"

**Memories:**
- All prev years for selected date
- Filters out today only
- Shows year + day of week

**Calendar:**
- Year-agnostic 7-col grid (no weekdays, no year)
- 1-31 numbered, today highlighted
- Dots on days with entries
- 35-cell grid (5×7) with placeholders for consistent size
- "M" button opens → "Memories from Yesteryear"

**Settings:**
- Theme selector
- Export (txt format: YYYY-MM-DD: text)
- Import (merges, overwrites duplicates)

## File Structure
```
src/
  components/  # CalendarModal, DateNavigation, EntryForm, MemoriesView, Settings
  hooks/       # useJournal (data ops), useTheme (theme state)
  utils/       # dateHelpers (noon logic), storage (IndexedDB), exportImport
  styles/      # themes.css (CSS variables)
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
- **No search** → Browse by date only
- **300 char limit** → By design for brevity
- **Single journal** → Can't separate work/personal

## Future Ideas (User-Approved)
1. **Full-text search** - Search all entries for keywords
2. **Optional cloud backup/sync** - Auto-backup, cross-device
3. **Streak tracking** - Days in a row, achievements
4. **Reminder notifications** - Daily PWA push notifications

## Changelog
**v1.1 (2026-01-27)** - PWA support, offline caching, installable
**v1.0 (2026-01-26)** - Initial release, core features, 3 themes, export/import

## Context for LLMs
Built with Claude AI through iterative development. Key evolution: GitHub Actions build issues → pivoted to local build + commit dist/. Prioritized simplicity, privacy, and reliability over complexity. Year-agnostic design emerged from user vision of cyclical time reflection.
