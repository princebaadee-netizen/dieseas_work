# Version 2 list

Everything that was deliberately left out of the first build, so nobody has
to guess whether it was forgotten or on purpose (Project Plan section 9.4).

These are for after the backend is working, not before. The frontend is
complete and tested without them.

## Content

| Idea | Why it was left |
|---|---|
| More diseases | Five are enough to prove the structure. The plan asks for the content to grow one condition at a time. |
| Alternate names and other names for a condition | The search rules do not have a field for them yet. Adding it later means a new column and a new search rule, which is a backend change. |
| A last-reviewed date per list item, not only per remedy | More work for the writer and the reviewer than it is worth yet. |
| Local languages | The site is written in plain English for now. |
| Pictures of symptoms | The plan says minimal imagery and no graphic medical photos. |

## Frontend

| Idea | Why it was left |
|---|---|
| Paging in the search results | The disease list is five records. The query and the filter are already in the web address, so paging can be added without touching the pages. |
| A dark mode | Not in the design plan. |
| Saving a search as a bookmark or a share link | The query in the address already does this by copying it. |
| Printing a disease page | A print stylesheet would help on paper handouts, which is a version 2 nicety. |
| An offline mode | Not useful for a site whose whole point is fresh health information. |

## Admin

| Idea | Why it was left |
|---|---|
| More than one administrator role | The plan asks for one administrator. Roles come with the backend and its permissions. |
| An audit trail of every change | A real requirement once there is a database, and the backend's job. |
| Bulk editing | The disease form sends the whole record, so a bulk edit is mostly a backend job too. |
| A spreadsheet import | Only worth building once there is content to import. |

## Backend and hosting

| Idea | Why it was left |
|---|---|
| A public sign-up page for administrators | The plan says the first administrator is created directly, and there is no sign-up. |
| A public API | Not asked for. The endpoints in [backend-endpoints.md](backend-endpoints.md) are for this frontend. |
| Automatic publishing schedules | The content is reviewed by a person before it goes live. |
| A newsletter or email alerts | Not in the plan. |

## The order to do them in

1. Paging, once the disease list is long enough to need it.
2. Alternate names, when the content team asks for them.
3. An audit trail, once there is more than one administrator.
4. Everything else, when there is a reason.
