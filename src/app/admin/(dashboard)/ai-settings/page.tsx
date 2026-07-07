import {
  AI_SETTINGS_KEYS,
  DEFAULT_AKOBOT_CHAT_SYSTEM_PROMPT,
} from "@/lib/ai-settings";
import {
  type AppConfig,
  getConfigByKey,
} from "@/lib/api/admin-server-client";
import { AiSettingsForm } from "./ai-settings-form";

function isConfig(value: unknown): value is AppConfig {
  return Boolean(value && typeof value === "object" && "key" in value);
}

async function loadConfig(key: string): Promise<AppConfig | null> {
  const response = await getConfigByKey(key);
  return response.ok && isConfig(response.data) ? response.data : null;
}

function readBoolean(config: AppConfig | null, fallback: boolean) {
  if (!config || config.isActive === false) return fallback;
  if (typeof config.value === "boolean") return config.value;
  if (typeof config.value === "string") {
    return ["true", "1", "yes", "on", "enabled"].includes(
      config.value.trim().toLowerCase()
    );
  }
  return fallback;
}

export default async function AiSettingsPage() {
  const [promptConfig, rawConfig, agentPaidConfig] = await Promise.all([
    loadConfig(AI_SETTINGS_KEYS.prompt),
    loadConfig(AI_SETTINGS_KEYS.rawChatEndpointsEnabled),
    loadConfig(AI_SETTINGS_KEYS.customAgentCreationRequiresPaid),
  ]);

  const systemPrompt =
    typeof promptConfig?.value === "string" && promptConfig.value.trim()
      ? promptConfig.value
      : DEFAULT_AKOBOT_CHAT_SYSTEM_PROMPT;

  return (
    <div className="p-4 transition-colors duration-300 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          AI Settings
        </h1>
        <p className="mt-2 max-w-3xl text-[var(--muted-foreground)]">
          Manage Akobot identity, product-scope behavior, raw text route access,
          and the custom-agent creation gate.
        </p>
      </header>

      <AiSettingsForm
        systemPrompt={systemPrompt}
        rawChatEndpointsEnabled={readBoolean(rawConfig, false)}
        customAgentCreationRequiresPaid={readBoolean(agentPaidConfig, true)}
      />
    </div>
  );
}
