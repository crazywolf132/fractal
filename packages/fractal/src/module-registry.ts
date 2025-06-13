const modules = new Map<string, any>();

export const registerModule = (name: string, module: any) => modules.set(name, module);

export const getModule = (name: string): any => modules.get(name) || {};

if (typeof window !== 'undefined') {
  (window as any).__fractalModules = { registerModule, getModule };
}