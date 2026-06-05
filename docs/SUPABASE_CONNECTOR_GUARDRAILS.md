# Supabase Connector Guardrails

Lovable is connected to the Framixor/SchedlyOps Supabase DEV project for frontend integration and visual testing only.

## Allowed

Lovable may:

- inspect existing schemas, tables, RPCs, and Edge Function contracts;

- call existing public RPCs for testing;

- call existing authenticated operator RPCs for testing;

- use real DEV data to validate UI behavior;

- update frontend code to consume existing RPCs correctly;

- report backend gaps or mismatches;

- propose backend changes in text for human review.

## Forbidden without explicit human approval

Lovable must not:

- create, alter, or delete database schemas;

- create, alter, or delete tables;

- create, alter, or delete columns;

- create, alter, or delete RLS policies;

- create, alter, or delete grants or permissions;

- create, alter, or delete database functions or RPCs;

- create, alter, or delete triggers;

- create, alter, or delete migrations;

- create, alter, or deploy Edge Functions;

- change Supabase Auth settings;

- change storage buckets or storage policies;

- use service-role keys;

- bypass RLS;

- insert or mutate data outside documented app workflows;

- generate backend objects automatically from prompts.

## Source of truth

Backend source of truth is the `framixor-supabase` repository.

All backend changes must be implemented there through:

- migrations;

- tests;

- documentation updates;

- explicit review.

SchedlyOps frontend must consume the existing backend contract. If the frontend needs a backend capability that does not exist, Lovable must stop and report the gap instead of inventing a workaround.

## Current integration mode

Current mode: frontend integration against DEV Supabase.

Allowed current surfaces:

- existing `scheduling.public_*` RPCs;

- existing `scheduling.operator_*` RPCs;

- existing auth/session flows;

- documented DEV seed data such as `demo-barber`.

Do not call undocumented RPCs.

Do not assume future migrations are live unless confirmed on DEV.

## Required behavior

When changing frontend code, Lovable must report:

- files changed;

- Supabase objects read or called;

- whether any backend mutation was attempted;

- validation results;

- any backend gaps found.
