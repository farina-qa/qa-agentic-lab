import { requireEnv } from './env';

/** A saucedemo account used by the tests. */
export type User = {
  username: string;
  password: string;
};

/**
 * The saucedemo accounts, built from environment variables.
 *
 * Credentials never appear as literals in the code, so nothing sensitive can
 * reach the public repository or a test report.
 */
export const users = {
  /** Behaves normally. Used for the happy path. */
  standard: {
    username: requireEnv('SAUCE_STANDARD_USER'),
    password: requireEnv('SAUCE_PASSWORD'),
  } satisfies User,

  /** Rejected by the application on purpose. */
  lockedOut: {
    username: requireEnv('SAUCE_LOCKED_OUT_USER'),
    password: requireEnv('SAUCE_PASSWORD'),
  } satisfies User,
};
