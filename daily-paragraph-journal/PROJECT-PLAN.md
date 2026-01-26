# One Line a Day Journal - Project Scope & Plan

## Project Overview
A web-based journal application that captures one memorable moment per day (up to 300 characters). The app features a warm, leather-bound journal aesthetic and allows users to revisit memories from the same day across different years.

## Core Features

### 1. Daily Entry System
- **Time Window**: Entries are associated with a day from noon to noon the following day
  - Entry made at 3 PM on Jan 24 → counts as Jan 24
  - Entry made at 9 AM on Jan 25 → still counts as Jan 24 (before noon cutoff)
- **Clear Date Display**: The entry form prominently displays which day the entry is for
  - Shows day of week and full date (e.g., "Wednesday, January 24, 2024")
  - When entering before noon, shows clear indicator that this is for yesterday
  - Example morning message: "You're writing about yesterday - Wednesday, January 24"
- **Character Limit**: 300 characters maximum per entry
- **One Entry Per Day**: Users can only create one entry per calendar day
- **Immutable Entries**: Once submitted, entries cannot be edited or deleted (like pen on paper)

### 2. Memory Reflection
- After submitting an entry, display a "Memories" page showing all previous entries from the same day (e.g., all Jan 24 entries from previous years)
- Chronological display from newest to oldest (most recent memories first)
- Each entry shows the year and the text

### 3. Navigation
- Default view: Current day's entry interface
- Calendar picker to navigate to specific dates
- Visual indication of which days have entries vs. blank days
- Ability to browse past entries by date

### 4. Visual Design - Leather Journal Aesthetic
- Warm, tactile design reminiscent of a cherished leather-bound journal
- Paper-like texture with subtle aging effects
- Handwritten/script font for entries
- Vintage color palette (warm browns, creams, sepia tones)
- Page-turning or similar transitions between views
- Hand-drawn accents and flourishes

### 5. Data Storage
- Local browser storage (localStorage/IndexedDB)
- All data stays on the user's device
- No cloud sync, no accounts required
- Privacy-first approach

## Technical Architecture

### Technology Stack
**Frontend Framework**: React with Vite
- Modern, fast development experience
- Component-based architecture ideal for different views (entry, memories, calendar)
- Excellent ecosystem and tooling

**Styling Approach**:
- Custom CSS with vintage/paper textures
- CSS Grid/Flexbox for layouts
- CSS pseudo-elements for depth and paper effects
- Handwriting/script fonts (e.g., Dancing Script, Caveat, or Indie Flower)
- Sepia filters and subtle gradients for aged effect

**Data Layer**:
- IndexedDB for persistent local storage (more robust than localStorage)
- Simple data model using date as key: `{ journalDay: "YYYY-MM-DD", text: "...", createdAt: timestamp }`
- No backend required for v1
- Designed to be cloud-ready for future migration

**Date/Time Handling**:
- Use `date-fns` or `day.js` for date manipulation
- Handle noon-to-noon day boundaries
- Timezone-aware calculations

### Project Structure
```
one-line-journal/
├── public/
│   └── assets/
│       ├── fonts/              # Handwriting fonts
│       └── textures/           # Paper/leather textures
├── src/
│   ├── components/
│   │   ├── EntryForm.jsx       # Daily entry input
│   │   ├── MemoriesView.jsx    # Past entries display
│   │   ├── Calendar.jsx        # Date navigation
│   │   ├── ExportImport.jsx    # Export/import functionality
│   │   └── Layout.jsx          # Journal aesthetic wrapper
│   ├── hooks/
│   │   └── useJournal.js       # Custom hook for entry CRUD
│   ├── utils/
│   │   ├── dateHelpers.js      # Noon-to-noon logic
│   │   ├── storage.js          # IndexedDB wrapper
│   │   └── exportImport.js     # Text file export/import logic
│   ├── styles/
│   │   ├── global.css          # Base styles, typography
│   │   ├── journal.css         # Leather/paper aesthetic
│   │   └── animations.css      # Page transitions
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

## Implementation Plan

### Phase 1: Core Foundation
1. **Project Setup**
   - Initialize Vite + React project
   - Install dependencies (date-fns, possibly react-router-dom)
   - Set up basic project structure

2. **Date Logic Implementation**
   - Create `dateHelpers.js` with noon-to-noon boundary logic
   - Function to get "journal day" from any timestamp
   - Function to check if current time is within a specific journal day
   - Function to get display message ("You're writing about today/yesterday")
   - Function to format date for display (e.g., "Wednesday, January 24, 2024")
   - Unit tests for edge cases (midnight, noon transitions)

3. **Data Layer**
   - Create `storage.js` wrapper for IndexedDB
   - Functions: `addEntry()`, `getEntry(journalDay)`, `getAllEntries()`, `getEntriesForMonthDay(month, day)`, `exportToText()`, `importFromText()`
   - Schema uses journalDay as primary key (no separate ID needed)

### Phase 2: Core Functionality
4. **Entry Form Component**
   - Prominent date header showing which day the entry is for
     - Format: "Day of Week, Month DD, YYYY" (e.g., "Wednesday, January 24, 2024")
     - If before noon: show contextual message like "You're writing about yesterday"
     - If after noon: show contextual message like "You're writing about today"
   - Text area with 300 character counter
   - Real-time character count display
   - Submit button (disabled if empty or over limit)
   - Validation: prevent multiple entries for same journal day
   - Success feedback on submission

5. **Memories View Component**
   - Fetch all entries matching current day (regardless of year)
   - Display in reverse chronological order (newest first) with year labels
   - Handle empty state (first time writing on this day)
   - "Return to today" button

6. **Basic Navigation**
   - App state to track current view (entry vs memories)
   - Automatic transition: after entry submission → memories view
   - Manual navigation between views

### Phase 3: Enhanced Navigation
7. **Calendar Component**
   - Month view calendar picker
   - Visual indicators for days with entries
   - Click to navigate to specific day's entry (view-only)
   - Highlight current journal day
   - Disable future dates

8. **App Flow Integration**
   - Default view: today's entry form (if no entry) or view (if entry exists)
   - Navigation between today/calendar/memories
   - Breadcrumb or back navigation

### Phase 4: Visual Design
9. **Typography & Fonts**
   - Import and apply handwriting fonts
   - Establish type scale and hierarchy
   - Ensure readability at 300 characters

10. **Journal Aesthetic**
    - Create paper texture background
    - Implement leather binding visual on sides/top
    - Add subtle shadows and depth
    - Page margins and binding offset effect
    - Vintage color palette application

11. **Micro-interactions**
    - Page turn animation when transitioning views
    - Ink-writing effect for entry submission
    - Hover states for interactive elements
    - Smooth transitions and animations

### Phase 5: Data Import/Export
12. **Export Functionality**
    - Create `exportToText()` function in storage.js
    - Generate text file with all entries in chronological order
    - Format: `YYYY-MM-DD: [entry text]` (one per line)
    - Download as `.txt` file
    - Add "Export Journal" button to UI

13. **Import Functionality**
    - Create `importFromText()` function in storage.js
    - Parse text file in format: `YYYY-MM-DD: [entry text]`
    - Validate dates and character limits
    - Handle duplicates (skip or prompt user)
    - Add "Import Journal" button to UI
    - File picker for `.txt` files

### Phase 6: Polish & Quality
14. **Responsive Design**
    - Mobile-first approach
    - Tablet and desktop layouts
    - Touch-friendly interface elements

15. **Accessibility**
    - Keyboard navigation
    - ARIA labels
    - Focus indicators
    - Sufficient color contrast

16. **Error Handling**
    - Storage quota exceeded scenarios
    - Browser compatibility checks
    - Graceful degradation
    - Import validation and error messages

17. **Performance**
    - Lazy loading for calendar entries
    - Optimize texture/image assets
    - Efficient IndexedDB queries

## Data Model

### Entry Schema
```javascript
{
  journalDay: String,      // YYYY-MM-DD (PRIMARY KEY - the journal day this belongs to)
  text: String,            // Max 300 chars
  createdAt: Number,       // Unix timestamp of creation
  year: Number,            // Extracted year for easy filtering
  month: Number,           // 1-12
  day: Number              // 1-31
}
```

**Rationale for using date as key:**
- Only one entry per day, so journalDay is naturally unique
- Simplifies lookups: `getEntry(journalDay)` instead of searching by date
- No need for auto-incrementing IDs
- Makes data structure more portable for future cloud migration
- Easier to export/import (date is human-readable identifier)

### Storage Strategy
- Use IndexedDB with `journalDay` as the keyPath (primary key)
- Create compound index on `(month, day)` for "this day in history" queries
- No additional ID needed - the date itself is the identifier

## Key Algorithms

### Noon-to-Noon Day Calculation
```javascript
// Pseudocode
function getJournalDay(timestamp) {
  const date = new Date(timestamp);
  const hour = date.getHours();

  if (hour < 12) {
    // Before noon, belongs to previous calendar day
    return formatDate(subtractDays(date, 1));
  } else {
    // After noon, belongs to current calendar day
    return formatDate(date);
  }
}
```

### Memory Retrieval
```javascript
// Pseudocode
function getMemoriesForDay(journalDay) {
  const [year, month, day] = parseDate(journalDay);

  // Query all entries with matching month/day, any year
  const memories = queryEntries({ month, day })
    .filter(entry => entry.year !== year) // Exclude current year
    .sort((a, b) => b.year - a.year);      // Newest first (descending)

  return memories;
}
```

## User Experience Flow

### First Visit (Afternoon - after noon)
1. User opens app at 3 PM on Jan 24
2. See header: "Wednesday, January 24, 2024" with message "You're writing about today"
3. See empty entry form
4. Write up to 300 characters
5. Click "Submit" or "Save Entry"
6. Automatically transition to Memories view
7. See message: "This is your first entry for January 24!"
8. Button to return to today or explore calendar

### First Visit (Morning - before noon)
1. User opens app at 9 AM on Jan 25
2. See header: "Wednesday, January 24, 2024" with message "You're writing about yesterday"
3. Entry form is for Jan 24, not Jan 25
4. User understands they're capturing yesterday's memorable moment
5. Write and submit entry for Jan 24

### Subsequent Visit (Same Journal Day)
1. User opens app
2. See the journal day's date clearly displayed
3. See their entry (read-only, no edit option)
4. Can navigate to calendar to view other days
5. Cannot create another entry for this journal day

### Next Day Visit
1. User opens app (after noon boundary has passed)
2. See new date header for the new journal day
3. See empty entry form
4. Write and submit
5. See memories from this day in previous years

### Browsing History
1. Click calendar icon
2. See monthly calendar with dots/indicators on days with entries
3. Click a past date
4. View that day's entry (read-only)
5. See memories from that day across years
6. Navigate back or to different date

## Browser Compatibility
- Target: Modern browsers (Chrome, Firefox, Safari, Edge)
- IndexedDB support (all modern browsers)
- CSS Grid/Flexbox support
- No IE11 support needed

## Progressive Web App (Optional Future Enhancement)
- Add manifest.json for "Add to Home Screen"
- Service worker for offline functionality
- Would make it feel more like a native app

## Verification & Testing

### Manual Testing Checklist
1. **Entry Creation**
   - [ ] Date header clearly shows which day the entry is for
   - [ ] Before noon: shows "You're writing about yesterday" message
   - [ ] After noon: shows "You're writing about today" message
   - [ ] Date format is readable (e.g., "Wednesday, January 24, 2024")
   - [ ] Can create entry with text up to 300 characters
   - [ ] Character counter updates in real-time
   - [ ] Cannot submit empty entry
   - [ ] Cannot submit entry over 300 characters
   - [ ] Entry is saved to storage
   - [ ] After submission, redirected to Memories view

2. **Noon Boundary Logic**
   - [ ] Entry created at 11:59 AM counts as previous day
   - [ ] Entry created at 12:00 PM counts as current day
   - [ ] Entry created at 1:00 AM counts as previous day
   - [ ] Only one entry allowed per journal day

3. **Memories View**
   - [ ] Shows all past entries from same day/month
   - [ ] Entries sorted chronologically (newest first)
   - [ ] Displays year with each entry
   - [ ] Shows appropriate message if no past entries
   - [ ] Current year's entry not shown in memories (or shown separately)

4. **Calendar Navigation**
   - [ ] Calendar shows current month by default
   - [ ] Days with entries have visual indicator
   - [ ] Can navigate to past months/years
   - [ ] Cannot navigate to future dates
   - [ ] Clicking date shows that day's entry
   - [ ] Can return to today easily

5. **Data Persistence**
   - [ ] Entries persist after browser close/reopen
   - [ ] Entries persist after browser refresh
   - [ ] Storage works across sessions

6. **Visual Design**
   - [ ] Journal aesthetic is consistent across all views
   - [ ] Fonts are readable at all sizes
   - [ ] Textures load properly
   - [ ] Animations are smooth
   - [ ] Color scheme is warm and inviting

7. **Responsive Design**
   - [ ] Mobile view is usable and attractive
   - [ ] Tablet view adapts appropriately
   - [ ] Desktop view makes good use of space
   - [ ] No horizontal scrolling on mobile

8. **Import/Export**
   - [ ] Can export all entries to a text file
   - [ ] Export format is readable (date: entry text)
   - [ ] Can import text file with same format
   - [ ] Import validates dates and character limits
   - [ ] Import handles duplicate dates appropriately
   - [ ] Error messages are clear for invalid imports

9. **Edge Cases**
   - [ ] What happens with very long words (no spaces)?
   - [ ] How do line breaks display in memories?
   - [ ] Storage quota exceeded handling
   - [ ] First-time user experience is clear

### Browser Testing
- Test in Chrome (latest)
- Test in Firefox (latest)
- Test in Safari (latest)
- Test on mobile Safari (iOS)
- Test on Chrome mobile (Android)

### Performance Testing
- [ ] App loads in under 2 seconds
- [ ] Entry submission feels instant
- [ ] Calendar navigation is smooth
- [ ] Memories view loads quickly even with many years of data
- [ ] No janky animations

## Future Enhancements (Post-Prototype)

### Planned for v2
- **Cloud storage with sync**: Store entries in cloud database (Firebase, Supabase, or custom backend)
- **User authentication**: Login system to protect journal entries
- **Multi-device sync**: Access journal from phone, tablet, desktop
- **Data migration**: Seamless upgrade path from local-only to cloud storage

### Other Future Ideas (Not Committed)
- Export as PDF with journal styling
- Search across all entries
- Tags or categories
- Monthly/yearly review summaries
- Optional photo attachment per entry
- Print physical journal option
- Themes (different journal styles)
- Encryption for added privacy
- Backup reminders

## Success Criteria
- Users can create one 300-character entry per day
- Noon-to-noon day boundaries work correctly
- Memories view shows accurate historical entries (newest first)
- Visual design evokes the feeling of a cherished journal
- Data persists reliably in local storage using date as primary key
- Can export all entries to a text file
- Can import entries from a text file
- Interface is intuitive without instructions
- App works on mobile and desktop browsers
- Architecture is designed to support future cloud migration

## Timeline Estimate
This is intentionally omitted per guidelines - implementation will be broken into phases that can be completed incrementally.

---

## Critical Files to Be Created

### Core Application
- `src/App.jsx` - Main app component and routing logic
- `src/main.jsx` - App entry point

### Components
- `src/components/EntryForm.jsx` - Daily entry input interface
- `src/components/MemoriesView.jsx` - Historical entries display (newest first)
- `src/components/Calendar.jsx` - Date picker and navigation
- `src/components/ExportImport.jsx` - Export/import UI and controls
- `src/components/Layout.jsx` - Journal aesthetic wrapper

### Utilities & Logic
- `src/utils/dateHelpers.js` - Noon-to-noon calculations
- `src/utils/storage.js` - IndexedDB wrapper (using journalDay as primary key)
- `src/utils/exportImport.js` - Text file export/import functions
- `src/hooks/useJournal.js` - Custom React hook for entry management

### Styling
- `src/styles/global.css` - Base styles and reset
- `src/styles/journal.css` - Leather/paper aesthetic
- `src/styles/animations.css` - Transitions and micro-interactions

### Configuration
- `vite.config.js` - Vite configuration
- `package.json` - Dependencies and scripts
- `index.html` - Entry HTML file
