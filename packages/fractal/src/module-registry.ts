class ModuleRegistry {
  private modules = new Map<string, any>();

  register(name: string, module: any): void {
    if (!name || typeof name !== 'string') {
      throw new Error('Module name must be a non-empty string');
    }
    
    if (!module) {
      throw new Error('Module cannot be null or undefined');
    }

    this.modules.set(name, module);
  }

  get(name: string): any | undefined {
    return this.modules.get(name);
  }

  has(name: string): boolean {
    return this.modules.has(name);
  }

  getAll(): Record<string, any> {
    return Object.fromEntries(this.modules);
  }

  clear(): void {
    this.modules.clear();
  }

  size(): number {
    return this.modules.size;
  }
}

const registry = new ModuleRegistry();

export const registerModule = (name: string, module: any): void => {
  registry.register(name, module);
};

export const getModule = (name: string): any | undefined => {
  return registry.get(name);
};

if (typeof window !== 'undefined') {
  (window as any).__fractalModules = { 
    registerModule, 
    getModule: (name: string) => registry.get(name) || {}
  };
}