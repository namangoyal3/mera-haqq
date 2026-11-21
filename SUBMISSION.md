# Mera Haqq - ACE Builders Hackathon 2026 submission draft

## Project name
Mera Haqq (मेरा हक़)

## Problem statement
PS5 - Claim What's Yours

## One-liner
A Hindi/English voice-first copilot that tells any Indian family which government schemes they are likely eligible for, why, and exactly how to claim them.

## Description (for the form)
Hundreds of central and state welfare schemes go unclaimed because eligibility rules are scattered across PDFs and portals, written in formal English most families can't parse. Mera Haqq fixes this with a conversational intake (one question at a time, Hindi or English, voice input supported), an editable JSON rules engine covering 16 major schemes, and results that show the exact rule you matched, the documents you need, numbered steps to apply, the official portal link, and a last-verified date. It estimates the yearly benefit you may be missing and lets you share that card with family on WhatsApp. Everything runs on-device: no Aadhaar asked, no data uploaded. Demo persona: Ramesh, 38, daily-wage worker in Bihar, discovers PMAY-G housing assistance (Rs 1.2 lakh), MGNREGA guaranteed work, and a pre-matric scholarship for his daughter.

## Live app
https://mera-haqq.pages.dev

## Public GitHub repo
https://github.com/namangoyal3/mera-haqq

## Demo video
https://mera-haqq.pages.dev/demo.mp4 (98 seconds, full intake-to-results walkthrough)

## Team
Naman Goyal (solo)

## Codebenders usage details (honest)
Built inside the Codebenders IDE using the Nexen AI agent (provider: Amazon Bedrock, model: Claude Haiku 5.5) under my account. The agent scaffolded the Vite + React + TypeScript + Tailwind app, wrote the rules engine, scheme dataset, intake parser, i18n and all UI components, ran npm builds, and applied two rounds of QA fixes from live testing. I directed it with product briefs and QA feedback, and verified builds and the deployed app myself. Note: I ran the IDE headlessly on a Linux server; to sign it in without a desktop browser I delivered the login token through a small patch to the auth extension's activation hook. All application code was written by the Nexen agent inside the Codebenders IDE.

Key prompts (full log in PROMPTS.md in the repo):
1. "Read BRIEF.md ... build the app exactly as specified: Vite+React+TS+Tailwind, fully client-side, Hindi+English conversational intake, JSON scheme rules engine, results with matched-rule reasons, WhatsApp-shareable result card, localStorage tracker, PWA offline... iterate until npm run build passes."
2. QA round 1: fix Rs 0 benefit-total bug, stop rendering Rs 0 benefits, remove internal jargon from UI, cleaner disclaimer, natural-answer parsing, engine recall for PM-JAY/Ujjwala/NSP, monthly income conversion.
3. QA round 2: add LPG and school-children questions, land "no land/kuch nahi" -> 0, "8000 per month" -> x12, "1.2 lakh" -> 120000, yearly-income hint; build until green.
