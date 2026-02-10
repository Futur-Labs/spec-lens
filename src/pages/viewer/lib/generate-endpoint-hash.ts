export function generateEndpointHash(method: string, path: string): string {
  return `${method.toLowerCase()}${path.replace(/[{}]/g, '')}`;
}
