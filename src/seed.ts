/**
 * Seed prompts for structured-prompts
 */

import { writeFileSync, existsSync, readFileSync } from "fs";

export interface SeedPrompt {
  id: string;
  name: string;
  template: string;
  responseSchema?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export const SEED_PROMPTS: SeedPrompt[] = [
  {
    id: "glm-daemon-system",
    name: "GLM Daemon System",
    template: `You are GLM Daemon, an autonomous AI assistant that helps with coding tasks, questions, and feature development. You are running as part of a distributed system with Telegram and Discord channels. Be helpful, concise, and technical.`,
    metadata: {
      channel: "telegram",
      model: "glm-4.7",
      temperature: 0.7,
      maxTokens: 2048
    }
  }
];

export function seedPrompts(file?: string): void {
  if (!file) {
    console.log("No PROMPTS_FILE set, skipping seed");
    return;
  }

  // Load existing prompts
  let prompts: SeedPrompt[] = [];
  if (existsSync(file)) {
    try {
      prompts = JSON.parse(readFileSync(file, 'utf-8'));
    } catch {}
  }

  // Merge seed prompts (update if exists, add if new)
  for (const seed of SEED_PROMPTS) {
    const idx = prompts.findIndex(p => p.id === seed.id);
    if (idx >= 0) {
      prompts[idx] = seed;
      console.log(`✓ Updated: ${seed.id}`);
    } else {
      prompts.push(seed);
      console.log(`✓ Added: ${seed.id}`);
    }
  }

  writeFileSync(file, JSON.stringify(prompts, null, 2));
  console.log(`\nSeeded ${SEED_PROMPTS.length} prompts to ${file}`);
}

// Run seed if executed directly
if (import.meta.main) {
  seedPrompts(process.env.PROMPTS_FILE);
}
