AGENTS.md
This file provides guidance to all agents, LLMs, and AI tools when working with code in this repository. These are a MUST, not optional or guidance.

## Rules

- Never write code with Claude Opus or GPT 5.5. These models are used only for planning and thinking. Code must be written only with Claude Sonnet 4.6 or GPT 5.4
- Every workflow step must be done by model antagonist: Claude -> GPT -> Claude -> GPT or GPT -> Claude -> GPT -> Claude
- Always use GPT for complex tasks implementations and Claude for UI/UX design
- Use Claude Haiku or GPT Codex 5.3 for simple dumb tasks with single file context
- The plan must be very specific with small chunks, with code samples, with minimum 95% accuracy, and with explanations on each part for the reasoning. The plan must be able to be implemented in paralell by dumb AI agents which work on independent files. The plan must always be "In review" before implementing it and must be marked as "Ready for development" before executing.
- Before writing a new component, function, class, type, interface, etc., search the codebase for similar code to not duplicate (DRY principle)
- When the accuracy is less than 95% and when in doubt, don't assume or halucinate. Ask the user questions and if the user is not sure, search the web and documentations.
- Never modify tests unless the user approves
- Always use strict types
- Never mask a problem, always find root cause
- Avoid monolythic files, extract reusable testable and simple code blocks outside in utils (pure utility functions), types (type, interface, union, etc.), constants (const, enum, etc.), components (React components), helpers (classes, managers, services, business logic etc.)
- Use at little words as possible. Think and "speak" (write) telegraphically like a robot to reduce token usage (energy) as much as possible (use caveman skill).
- Be critical and think like an experienced software engineer. Focus on facts, not opinions.

## Workflow

- Plan -> Plan review -> Execute -> Test
