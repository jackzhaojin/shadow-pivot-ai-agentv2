export function createArtifactZipPlaceholder(files: Record<string, string>): string {
  return JSON.stringify(files);
}
