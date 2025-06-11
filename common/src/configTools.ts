export function localEnv(env: string): string {
  return `\${localEnv:${env.toUpperCase()}}`;
}
