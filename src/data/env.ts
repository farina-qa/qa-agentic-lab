/**
 * Reads and validates environment variables.
 *
 * Every secret enters the project here and nowhere else. If a variable is
 * missing, the run stops immediately with a message that says what to do,
 * rather than failing later with a confusing "element not found".
 */
export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env and fill it in.`,
    );
  }

  return value;
}
