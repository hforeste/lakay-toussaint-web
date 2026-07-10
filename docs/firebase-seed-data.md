# Firebase Seed Data

Use these records in the local Firestore emulator and production Firestore `events` collection. Event pages read from Firebase; these examples are not meant to be hardcoded in page components.

## Collection: `events`

```json
[
  {
    "slug": "a-taste-of-haiti-2026",
    "title": "A Taste of Haiti",
    "startsAt": "2026-09-07T18:00:00-07:00",
    "locationName": "Location to be confirmed",
    "locationAddress": "Seattle, WA",
    "summary": "A community celebration of Haitian food, culture, and connection.",
    "description": "Join Lakay Toussaint Community Alliance for a celebration that brings Seattle's Haitian diaspora together through food, culture, music, and community connection.",
    "rsvpUrl": "https://example.com/a-taste-of-haiti",
    "status": "published",
    "order": 1
  },
  {
    "slug": "1804-celebration-2027",
    "title": "1804 Celebration",
    "startsAt": "2027-01-01T18:00:00-08:00",
    "locationName": "Location to be confirmed",
    "locationAddress": "Seattle, WA",
    "summary": "A Haitian Independence Day celebration honoring history, culture, and community.",
    "description": "Celebrate Haitian independence and the legacy of 1804 with community, culture, and shared purpose.",
    "rsvpUrl": "https://example.com/1804-celebration",
    "status": "published",
    "order": 2
  }
]
```
