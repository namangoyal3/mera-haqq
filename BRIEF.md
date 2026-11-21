# Mera Haqq — ACE Builders Hackathon 2026, Problem Statement 5 ("Claim What's Yours")

A web app that answers, for any Indian family: "which government schemes am I likely eligible for, and how exactly do I claim them?"

## User
One specific group to optimise for first: low-income rural/semi-urban families (daily-wage workers, small farmers, elderly parents, students) in India, on a shared basic Android phone.

## Core flows (all must work, client-side, no backend)
1. CONVERSATIONAL INTAKE (not a long form): a chat-like flow that asks one question at a time (age, state, occupation, income band, family details, land, caste/category, disability, girl child...). Supports Hindi and English UI toggle. Free-text answers allowed; voice input via Web Speech API (hi-IN) with graceful fallback.
2. ELIGIBILITY ENGINE: scheme rules stored as editable JSON data (one file per scheme or one schemes.json). Engine evaluates profile vs rules and returns: likely-eligible schemes, each with the EXACT rule that matched (human-readable reason), plus "possible" schemes with the missing info needed to decide.
3. RESULTS: for each match — what the benefit is (amount), documents checklist, step-by-step how to apply, official portal link, office to visit, deadline if any.
4. RESULT CARD + SHARE: a summary card "You may be missing up to Rs X/year in benefits" with a Share on WhatsApp button (wa.me share link, shares only when the user taps).
5. TRACKING: save applications to localStorage with status + deadline reminders (local notification simulation / list).
6. SOURCES: every scheme shows official source URL + "last verified" date (use 21 Nov 2026).

## Guardrails (hard requirements)
- Always say "likely eligible", never "guaranteed".
- Never ask for Aadhaar number or any sensitive ID.
- All test data is synthetic sample profiles (e.g. "Ramesh, 38, daily-wage worker, Bihar").
- Privacy-first: everything stays on the device (localStorage). Say so in the UI.

## Scheme dataset (seed with these, real rules, official URLs)
PM-KISAN, Ayushman Bharat PM-JAY, PM Awas Yojana (Gramin), MGNREGA job card, National Scholarship Portal (pre/post-matric), Sukanya Samriddhi Yojana, PM Matru Vandana Yojana, PM Ujjwala Yojana, PM Vishwakarma, Kisan Credit Card, Indira Gandhi National Old Age Pension (IGNOAPS), widow pension (IGNWPS), disability pension (IGNDPS), PM Jan Dhan, Ladli Behna (state example: MP), one Bihar and one UP state scheme if known. For each: benefit amount, key eligibility rules as structured data, documents, how-to-apply steps, official URL.

## Design
Mobile-first, Hindi+English, warm trustworthy visual style (Indian government-adjacent but friendly), large tap targets, works offline after first load (PWA-lite: manifest + service worker optional if time). Fast, single-page app feel.

## Stack
Plain Vite + React + TypeScript + Tailwind (no backend). Pure client-side. Must build with `npm run build` producing static dist/.
