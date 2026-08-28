# Monitoring System — Dashboard Foundation Design

## Goal

Create a standalone Monitoring System project in `D:\App\APTIKA\monitoring_system`. The first delivery is a responsive dashboard shell that reflects the supplied Diskominfo monitoring design without connecting to a backend yet.

## Scope: stage 1

- A desktop-first dashboard layout that remains usable in a 3:4 viewport.
- A monitoring sidebar with the Dashboard item selected and placeholder navigation items.
- A top header with the current date/time label, auto-refresh status, notification control, and operator identity.
- Five static status cards: Total Aplikasi, Online, Warning, Offline, and Maintenance.
- Mock dashboard data stored separately from the UI components.

## Explicitly out of scope

- Charts, status donut, incident table, uptime list, and Perangkat Daerah summary.
- Authentication, API calls, database design, polling, notifications, and monitoring-engine integration.
- Interactions other than responsive sidebar presentation.

## Architecture

Use a standalone Next.js project with Tailwind CSS and shadcn/ui-compatible component conventions. Keep the dashboard route focused on composition and move these responsibilities into separate units:

- `app/page.tsx`: page composition only.
- `components/dashboard/MonitoringSidebar.tsx`: branding and navigation.
- `components/dashboard/MonitoringHeader.tsx`: utility controls and operator identity.
- `components/dashboard/StatusCard.tsx`: reusable visual treatment for one status metric.
- `lib/dashboard-data.ts`: typed mock metric data.

The initial page reads mock data directly. A later API layer can replace that data module without changing the status-card interface.

## Responsive behavior

- Wide screens: persistent left sidebar and five-card responsive grid.
- 3:4 and smaller: compact header, sidebar collapses behind a menu control, and cards reflow to one or two columns without horizontal scrolling.

## Error handling and testing

The first stage has no network or user input. TypeScript provides the data-shape guard; lint and production build must complete successfully. Later stages will add loading, empty, and API-error states when the data source is introduced.

## Acceptance criteria

- The project runs independently from APTIKA Tools.
- The root page visually follows the supplied dashboard reference for the stage-1 elements.
- The five status cards show the reference values: 215, 209, 4, 2, and 0.
- The layout stays readable at a 3:4 viewport with no horizontal page overflow.
