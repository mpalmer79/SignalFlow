# Vertical Packs

Vertical packs are the formal industry configurations that let SignalFlow adapt across industries without changing the core engines. A pack is pure data. It owns the signal archetypes, opportunity types, scoring modifiers, workflow assumptions, revenue assumptions, and recommended actions for one industry. Packs drive the scenario and simulation engines.

Everything is deterministic and demo safe. Packs contain no live integrations, no secrets, and no real customer data.

## Pack structure

Each pack is a `VerticalPackConfig`:

- id and name
- tagline and the business objects the industry works with
- signal archetypes, each with a normalized type, label, detail, recommended channel, and weight
- opportunity types with deterministic value bands
- outcomes the industry produces
- recommended actions
- scoring modifiers (intent, opportunity, engagement bias)
- workflow assumptions (primary and fallback channel, escalation behavior)
- revenue assumptions (average deal value, recovery rate, miss rate)
- compliance sensitivity

The registry in `lib/verticals/registry.ts` is the single source of truth.

## Included packs

### Automotive

Objects: sales lead, vehicle, trade appraisal, service opportunity, recall opportunity, lease maturity, equity opportunity. Signals include vehicle viewed, trade submitted, lead form submitted, missed sales call, service due, and recall notice. Outcomes include test drive scheduled, appointment booked, vehicle sold, service appointment, and lost opportunity. Highest deal values in the platform.

### Dental

Objects: patient, cleaning recall, treatment plan, insurance review. Signals include overdue cleaning, missed appointment, treatment plan pending, and insurance verification. Outcomes include appointment scheduled, patient reactivated, treatment accepted, and no response. Elevated compliance sensitivity.

### Home Services

Objects: estimate request, service plan, property, maintenance opportunity. Signals include estimate submitted, missed call, seasonal reminder, and warranty expiring. Outcomes include estimate scheduled, job won, maintenance booked, and lost lead. High opportunity bias for system replacements.

### Legal Intake

Objects: consultation request, case intake, referral. Signals include consultation request, website intake, and referral received. Outcomes include consultation scheduled, case accepted, and case declined. High compliance sensitivity with advice boundaries, so the primary channel is a human task.

### Insurance

Objects: quote request, policy review, renewal opportunity. Signals include quote requested, renewal approaching, coverage inquiry, and missed agent call. Outcomes include policy bound, renewal completed, and opportunity lost. Elevated compliance sensitivity.

## How packs drive the platform

The scenario engine selects a pack, generates a customer and a signal mix from the pack archetypes, then runs the existing intelligence, workflow, and outcome engines. The simulation engine does the same across a generated population. Because packs are pure data, adding a new industry is a configuration change, not an engine change.
