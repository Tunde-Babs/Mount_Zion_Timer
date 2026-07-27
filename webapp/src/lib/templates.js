// Starter agenda templates so a new user has a working schedule in one click.
// Durations are in milliseconds.
export const AGENDA_TEMPLATES = [
  {
    id: 'sunday-service',
    name: 'Sunday Service',
    description: 'A typical weekly worship service running order.',
    timers: [
      { title: 'Praise & Worship', duration: 20 * 60000, notes: 'Opening songs + welcome' },
      { title: 'Announcements', duration: 5 * 60000, notes: '' },
      { title: 'Offering', duration: 10 * 60000, notes: '' },
      { title: 'Sermon', duration: 40 * 60000, notes: 'Main message' },
      { title: 'Altar Call', duration: 10 * 60000, notes: '' },
      { title: 'Closing Prayer', duration: 5 * 60000, notes: '' }
    ]
  },
  {
    id: 'bible-study',
    name: 'Midweek Bible Study',
    description: 'A focused teaching session with Q&A.',
    timers: [
      { title: 'Opening Prayer', duration: 5 * 60000, notes: '' },
      { title: 'Worship', duration: 10 * 60000, notes: '' },
      { title: 'Teaching', duration: 45 * 60000, notes: '' },
      { title: 'Q&A / Discussion', duration: 15 * 60000, notes: '' },
      { title: 'Closing Prayer', duration: 5 * 60000, notes: '' }
    ]
  },
  {
    id: 'conference-day',
    name: 'Conference Session',
    description: 'Keynote-style session block with speaker changeovers.',
    timers: [
      { title: 'Doors Open / Registration', duration: 15 * 60000, notes: '' },
      { title: 'Welcome & Housekeeping', duration: 5 * 60000, notes: '' },
      { title: 'Keynote Speaker', duration: 30 * 60000, notes: '' },
      { title: 'Panel Discussion', duration: 30 * 60000, notes: '' },
      { title: 'Break', duration: 15 * 60000, notes: 'Refreshments' },
      { title: 'Workshop Session', duration: 45 * 60000, notes: '' },
      { title: 'Closing Remarks', duration: 10 * 60000, notes: '' }
    ]
  },
  {
    id: 'wedding',
    name: 'Wedding Ceremony',
    description: 'Simple ceremony-to-reception running order.',
    timers: [
      { title: 'Guest Seating', duration: 20 * 60000, notes: '' },
      { title: 'Processional', duration: 5 * 60000, notes: '' },
      { title: 'Ceremony', duration: 30 * 60000, notes: '' },
      { title: 'Recessional & Photos', duration: 20 * 60000, notes: '' },
      { title: 'Reception Speeches', duration: 25 * 60000, notes: '' }
    ]
  },
  {
    id: 'blank-quick',
    name: 'Quick Start (3 timers)',
    description: 'A minimal set to get moving immediately.',
    timers: [
      { title: 'Session 1', duration: 15 * 60000, notes: '' },
      { title: 'Session 2', duration: 15 * 60000, notes: '' },
      { title: 'Session 3', duration: 15 * 60000, notes: '' }
    ]
  }
];
