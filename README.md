# AY Smart Home (Home Assistant–compatible)

Dashboard built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. Designed for **Home Assistant compatibility**. Home Assistant is the single source of truth; the dashboard is a client UI. Device state is mapped from HA entities.

## Architecture (conceptual)

```
Zigbee Device → Zigbee Coordinator (ZHA / Zigbee2MQTT) → Home Assistant Core
  → Home Assistant REST / WebSocket API → AY Smart Home
```

Only **AY Smart Home** (the dashboard) is implemented in this repo. Everything else is simulated for local development.

## Entity-first model

- Everything is modeled as **Home Assistant entities** (e.g. `light.living_room_ceiling`, `switch.garden_light`, `sensor.temperature_bedroom`, `binary_sensor.door_main`, `lock.front_door`, `climate.living_room_ac`).
- Each UI device card maps to **one or more entities**.
- **Demo HA state store**: `entity_id`, `state`, `attributes`, `last_changed`, `last_updated` (all local and fake).
- **Device mapping layer**: `DashboardDevice` → `entityIds[]` (see `lib/home-assistant/entity-mapper.ts`).
- UI renders by **entity domain** (light, switch, sensor, binary_sensor, lock, climate, cover, fan, alarm_control_panel, camera placeholder).

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. **Push the repo to GitHub** (or GitLab/Bitbucket).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. **Framework Preset:** Next.js (auto-detected). Leave **Build Command** `next build` and **Output Directory** empty.
4. **Deploy.** Vercel will build and host the app. Clean URLs (`/security`, `/devices`, etc.) and refresh work without any rewrites.

Your site will be at `https://<project-name>.vercel.app`. Add a custom domain in the Vercel project settings if you like.

**Sharing (OG / Twitter):** Set `NEXT_PUBLIC_APP_URL` in Vercel → Project → Settings → Environment Variables to your production URL (e.g. `https://your-app.vercel.app`) so Open Graph and Twitter card links use the correct domain. The app uses `app/icon.png`, `app/favicon.ico`, and a generated `opengraph-image` (1200×630) for social previews.

## Folder structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx, rooms/, devices/, gateways/, automations/, energy/, security/
│   └── settings/
│       ├── page.tsx
│       └── integrations/page.tsx   # Home Assistant + Zigbee
├── components/
│   ├── layout/          # Sidebar, TopBar, DashboardShell (no demo header)
│   ├── ui/              # ProtocolBadge, GatewayStatus
│   ├── controls/        # ToggleSwitch, SliderControl, ColorPicker
│   ├── dashboard/       # DeviceCard, EntityControls, DomainIcon, RoomSection
│   ├── automations/     # AutomationCard, AutomationBuilder, AutomationRuleEditor
│   └── energy/          # UsageChart, DeviceConsumption
├── lib/
│   ├── home-assistant/
│   │   ├── types.ts       # HAEntityState, HADomain, HAStateStore
│   │   ├── entities.ts    # entity_id constants, getDomain
│   │   ├── mock-state.ts  # Demo HA state (replace for real HA API)
│   │   ├── entity-mapper.ts # DashboardDevice → entityIds[], category, protocol
│   │   └── services.ts    # applyServiceCall (light.turn_on, switch.toggle, etc.)
│   ├── types/
│   ├── data/
│   └── context/
│       └── HomeAssistantContext.tsx  # entities, callService, dashboardDevices, automations
```

## Settings → Integrations

- **Home Assistant**: Connection Status: Demo Mode, API Type: REST / WebSocket (labels), URL: http://homeassistant.local, Token: Not Configured, Entity Count (simulated).
- **Zigbee**: ZHA / Zigbee2MQTT: Not Connected (simulated).

## Service call simulation

Simulated HA service calls (no network; update mock state only):

- `light.turn_on` / `light.turn_off`
- `switch.turn_on` / `switch.turn_off` / `switch.toggle`
- `lock.lock` / `lock.unlock`
- `climate.set_temperature`, `climate.set_hvac_mode`, `climate.set_fan_mode`
- `cover.open_cover`, `cover.close_cover`, `cover.set_cover_position`
- `fan.turn_on`, `fan.turn_off`, `fan.set_percentage`
- `alarm_control_panel.alarm_arm_home` / `alarm_disarm`

## Automations

- **Trigger** / **Condition** / **Action** (conceptually aligned with HA).
- **Action**: HA service call (stored locally; do not execute in demo).
- Stored in local state only.

## UX copy

- Controls: **"Demo Mode – Home Assistant not connected"**.
- Entities: **"Simulated Home Assistant Entity"**.
- Advanced view: show **entity_id**; **domain icon** and **protocol badge** (Zigbee / Wi‑Fi / etc.) on cards.

## Real HA integration

Replace only:

- **mock-state** → HA REST/WebSocket API for state.
- **Service handlers** in `services.ts` → real HA API calls.

No major refactor of UI or entity model.

## Tech stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS
- Local React state (HA state store simulated)
- Lucide icons
- No real HA connection, no WebSocket, no auth, no YAML, no add-ons
