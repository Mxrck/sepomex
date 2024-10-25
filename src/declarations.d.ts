declare module 'chroma-highlight' {
  export function highlight(code: string, args: string): string | Promise<string>;
}