Sample single-bulletin JSON:

```json
{"meta":{"title":"South Asia Weather & Ocean Outlook","date":"2026-09-01","subtitle":"Record of Discussion","name":"Weekly SAHF Forecasters' Forum #220"},"realized":[{"desc":"<p>Partly to mostly cloudy; scattered rainfall and thunderstorms, with hail; light snowfall in higher elevations; temperatures are normal to slightly below normal</p>","title":"Bhutan","image":"https://picsum.photos/200"},{"desc":"<p>Heaavy to very heavy widespread rainfall with thunderstorms and lightning, especailly in northern and northeastern regions; temperatures decreased in many areas, localized heat stress persisted in the humid southwest.</p>","title":"Bangladesh","image":"https://picsum.photos/200/300"}],"keyMessages":[{"message":"<p>Weather conditions likely over the east and northeast</p>","image":"https://picsum.photos/200"},{"message":"<p>Warmer conditions likely over the west and central regions</p>","image":"https://picsum.photos/200/300"}],"drivers":[{"message":"<p>Strengthened cross equatorial flow will enhance moisture</p>","image":"https://picsum.photos/200"},{"message":"<p><br></p>\n<p>Active/near circulation over the Bay of Bengal will support moisture convergence over eastern and northeasatern areas.</p>","image":"https://picsum.photos/200/300"}],"sevenDay":[{"title":"Bhutan","image":"https://picsum.photos/200","desc":"Partly cloudy to cloudy, moderate to heavy rainfall with isolated thunderstorms in south."},{"title":"Bangladesh","image":"https://picsum.photos/200","desc":"Widespread rain and thunderstorms; locally heavy to very heavy rain could lead to localized flash southern and northern"}],"extended":[{"title":"Temperature Outlook","image":"https://picsum.photos/200","points":[{"text":"Normal in South Asia"},{"text":"Above normal in Pakistan"},{"text":"Overall heaat stress"}]},{"title":"Rainfall Outlook","image":"https://picsum.photos/200/300","points":[{"text":"Above -normal rainfall is expected over Bangladesh, northeastern"}]}],"oceanWatch":[{"title":"Observed(24-30 Apr) Ocean Conditions","items":[{"desc":"Ocean conditions","image":"https://picsum.photos/200"},{"image":"https://picsum.photos/200/300","desc":"Surface winds about 0.6-2.5m"}]},{"title":"Forecast(1-7 May) Ocean conditions","items":[{"image":"https://picsum.photos/200","desc":"Oceaan conditions expected to remain near normal to moderate across the Bay of Bengal"}]}],"logos":[{"name":"Sunny 150","url":"https://picsum.photos/200"},{"name":"Cloudy 150","url":"https://picsum.photos/200/300"},{"name":"Rain 150","url":"https://picsum.photos/200/400"}],"driversTitle":"Key Regional Drivers (1-7 May 2026)","sectionTitles":{"realized":"Realized Weather (24-30 Apr 2026)","keyMessages":"Key Messages","drivers":"Key Regional Drivers (1-7 May 2026)","sevenDay":"7-day Country Outlook (1-7 May 2026)","extended":"Extended Range Outlook (30 Apr-31 May 2026)","oceanWatch":"Ocean Watch","logos":"Logos"},"sectionSubtitles":{"realized":"What happened this week?","drivers":"What will drive weather next week?"},"savedAt":1788453846420}
```

## API surface

The current editor only calls the image service and stores bulletin data in `localStorage`. A server-backed implementation can use the following endpoints.

The saved bulletin contains two levels of heading content:

- `meta.title` and `meta.subtitle` describe the complete bulletin.
- `sectionTitles` and `sectionSubtitles` describe each editable bulletin section.

The temporary editor draft uses the same JSON shape under the `unSavedDraft` localStorage key. Explicitly saved bulletins use a `bulletin:<date>` or timestamp-based localStorage key.

### Required first

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/bulletins` | List bulletins with search, date range, status, page, and sort filters. |
| `POST` | `/api/bulletins` | Create a bulletin from the JSON document below. |
| `GET` | `/api/bulletins/:bulletinId` | Load one complete bulletin for editing or preview. |
| `PATCH` | `/api/bulletins/:bulletinId` | Save partial edits and section changes. |
| `DELETE` | `/api/bulletins/:bulletinId` | Delete or archive a bulletin. |
| `GET` | `/api/bulletins/:bulletinId/versions` | Show revision history. |
| `POST` | `/api/bulletins/:bulletinId/publish` | Validate and publish a bulletin. |
| `GET` | `/api/images` | Return image choices for the picker. |
| `GET` | `/api/images/:section` | Return section-specific image choices. |
| `POST` | `/api/images` | Upload an image and return its URL and metadata. |

### Weather-driven content

These endpoints make sections dynamic instead of requiring editors to type every value manually.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/weather/observations?region=...&from=...&to=...` | Populate realized weather cards. |
| `GET` | `/api/weather/forecast?region=...&days=7` | Populate the seven-day outlook. |
| `GET` | `/api/weather/extended?region=...&period=...` | Populate temperature, rainfall, and wind outlook points. |
| `GET` | `/api/ocean/conditions?region=...&from=...&to=...` | Populate Ocean Watch cards. |
| `GET` | `/api/weather/drivers?region=...&date=...` | Return regional drivers and their explanatory text. |
| `POST` | `/api/bulletins/:bulletinId/generate` | Generate or refresh sections from selected weather data. |

### Workflow and collaboration

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/bulletins/:bulletinId/validate` | Return missing fields, invalid images, and publication warnings. |
| `POST` | `/api/bulletins/:bulletinId/preview` | Generate a preview URL or rendered HTML/PDF. |
| `GET` | `/api/bulletins/:bulletinId/export?format=pdf` | Download a PDF, JSON, or HTML bulletin. |
| `POST` | `/api/bulletins/:bulletinId/duplicate` | Create a new bulletin from an existing one. |
| `POST` | `/api/bulletins/:bulletinId/submit` | Submit a draft for review. |
| `POST` | `/api/bulletins/:bulletinId/approve` | Approve a submitted bulletin. |
| `GET` | `/api/users` | Provide authors, reviewers, and publishers. |
| `GET` | `/api/bulletins/:bulletinId/activity` | Return audit events and user actions. |
| `GET` | `/api/bulletins/:bulletinId/stream` | Optional Server-Sent Events stream for live edits and status changes. |

### Recommended response shape

All endpoints should return a consistent envelope:

```json
{
  "data": {},
  "meta": {
    "requestId": "req_123",
    "updatedAt": "2026-09-03T10:30:00Z"
  },
  "errors": []
}
```

For list endpoints, `data` can be an array and `meta` should additionally contain `page`, `pageSize`, `total`, and `hasNextPage`. Write endpoints should return the complete saved bulletin, including its `id`, `version`, `status`, `createdBy`, `updatedBy`, `createdAt`, and `updatedAt`.

### Dynamic editor flow

1. `GET /api/bulletins/:bulletinId` loads the document and its version.
2. The editor requests images and weather data for the selected region and date.
3. Section refreshes call `/generate` or the individual weather endpoints.
4. Edits autosave with debounced `PATCH` requests and an `If-Match` version header to prevent overwrites.
5. `/validate` drives inline errors before `/publish` is allowed.
6. `/preview` and `/export` provide the final rendered bulletin.

The frontend should keep `localStorage` only as an offline draft cache, not as the source of truth once these APIs are available.