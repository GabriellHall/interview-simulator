# Interview Simulator

An AI-powered behavioral interview practice app built with Next.js 15 and the Anthropic API (Claude Sonnet 4.6). Users practice behavioral, case, and situational questions with instant STAR-framework feedback.

## Tech stack
- **Framework**: Next.js 15 (App Router, TypeScript)
- **AI**: Anthropic SDK — `claude-sonnet-4-6`, tool-use for structured output, ephemeral prompt caching
- **Styling**: Tailwind CSS with a custom `brand` blue palette
- **State**: Client-side localStorage only (no database)
- **Deploy**: Vercel — requires `ANTHROPIC_API_KEY` environment variable

## Project structure
```
app/
  page.tsx          — Landing page
  setup/page.tsx    — Profile + session configuration
  interview/page.tsx — Question display + answer input
  feedback/page.tsx  — Per-question AI feedback
  results/page.tsx   — Session summary after all questions
  history/page.tsx   — Past sessions browser
  api/
    generate-questions/route.ts  — Generates 5 questions via Claude
    evaluate-answer/route.ts     — Evaluates an answer via Claude
    fetch-jd/route.ts            — Fetches + cleans a job description URL
components/
  Header.tsx, ProfileForm.tsx, QuestionCard.tsx, AnswerInput.tsx, FeedbackPanel.tsx
lib/
  anthropic.ts        — Singleton Anthropic client
  prompts.ts          — System/user prompt builders + tool schemas
  types.ts            — Shared TypeScript types
  storage.ts          — localStorage helpers (profile, session, history)
  default-profile.ts  — Pre-filled profile defaults for Gabriell
  jd-extract.ts       — HTML-to-text cleaner for job descriptions
```

## User background (Gabriell Hall)
This app is built for Gabriell Hall. The default profile and all prompts should be calibrated to her background:

- **Current role**: MBA Candidate, Stanford GSB (Class of 2026)
- **Prior experience**: Management consultant at Deloitte Digital — product design, innovation, go-to-market strategy; human-centered research, co-creation labs, user interviews; led cross-functional teams from concept through launch
- **Startup experience**: Chief of Staff at a pre-launch textured haircare startup — owned cross-functional operations across product development, brand storytelling, and marketing
- **Target role**: Product Manager at a technology company
- **Industry focus**: Technology / Product (intersection of technology, design, and social psychology)
- **Long-term vision**: Build products that deepen human connection; ensure emerging technology helps people become more human, not less; research how technology reshapes human cognition, behavior, and relationships
- **Key strengths**: Human-centered research and design, product strategy and roadmapping, storytelling and brand voice, cross-functional leadership, community building

## Development
```bash
cp .env.local.example .env.local  # add your ANTHROPIC_API_KEY
npm install
npm run dev                        # http://localhost:3000
npm run build                      # verify TypeScript + Next.js build
```
