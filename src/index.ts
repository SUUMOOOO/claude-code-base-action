#!/usr/bin/env bun

import * as core from "@actions/core";
import { preparePrompt } from "./prepare-prompt";
import { runClaude } from "./run-claude";
import { validateEnvironmentVariables } from "./validate-env";
import { setupOAuthCredentials } from "./setup-oauth";

async function run() {
  try {
    validateEnvironmentVariables();

    // Setup OAuth credentials if using OAuth authentication
    if (process.env.CLAUDE_CODE_USE_OAUTH === "1") {
      await setupOAuthCredentials({
        accessToken: process.env.CLAUDE_ACCESS_TOKEN!,
        refreshToken: process.env.CLAUDE_REFRESH_TOKEN!,
        expiresAt: process.env.CLAUDE_EXPIRES_AT!,
      });
    }

    const promptConfig = await preparePrompt({
      prompt: process.env.INPUT_PROMPT || "",
      promptFile: process.env.INPUT_PROMPT_FILE || "",
    });

    await runClaude(promptConfig.path, {
      allowedTools: process.env.INPUT_ALLOWED_TOOLS,
      disallowedTools: process.env.INPUT_DISALLOWED_TOOLS,
      maxTurns: process.env.INPUT_MAX_TURNS,
      mcpConfig: process.env.INPUT_MCP_CONFIG,
      model: process.env.ANTHROPIC_MODEL,
    });
  } catch (error) {
    core.setFailed(`Action failed with error: ${error}`);
    core.setOutput("conclusion", "failure");
    process.exit(1);
  }
}

if (import.meta.main) {
  run();
}
