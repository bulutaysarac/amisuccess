# amisuccess

A sprint story-point tracker. Set a target for the sprint, log your tasks with their story points, and see where you stand against it.

## Features

- Task table with story points and updated story points
- A sprint **target** you measure progress against
- Status tracking across the full workflow — Groomed, Backlog, Development In Progress, Development Done, Code Review Done, QA In Progress, QA Done, UAT OPAM, UAT PARTNER, DONE
- Everything persists to `localStorage`, so there's no backend to run
- Input validation with error dialogs

## Stack

Vue 3 (`<script setup>`) · PrimeVue 4 · Tailwind CSS · Vite

## Running

```bash
npm install
npm run dev
```

Then `npm run build` for a production bundle.
