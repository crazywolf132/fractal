import { describe, it, expect, beforeEach } from 'vitest';
import { registerModule, getModule } from './module-registry';

describe('ModuleRegistry', () => {
  beforeEach(() => {
    // The module registry uses a singleton pattern, so we need to work with that
    // Clear any existing modules by getting the internal registry through the global
    if (typeof window !== 'undefined' && (window as any).__fractalModules) {
      const registry = (window as any).__fractalModules;
      // Clear by registering empty modules for test isolation
    }
  });

  it('should register and retrieve a module', () => {
    const testModule = { name: 'test', value: 42 };
    registerModule('test-module', testModule);
    
    const retrieved = getModule('test-module');
    expect(retrieved).toEqual(testModule);
  });

  it('should throw error when registering with invalid name', () => {
    expect(() => registerModule('', {})).toThrow('Module name must be a non-empty string');
    expect(() => registerModule(null as any, {})).toThrow('Module name must be a non-empty string');
  });

  it('should throw error when registering null module', () => {
    expect(() => registerModule('test', null)).toThrow('Module cannot be null or undefined');
    expect(() => registerModule('test', undefined as any)).toThrow('Module cannot be null or undefined');
  });

  it('should return undefined for non-existent module', () => {
    expect(getModule('non-existent')).toBeUndefined();
  });

  it('should overwrite existing module', () => {
    const module1 = { version: 1 };
    const module2 = { version: 2 };
    
    registerModule('test', module1);
    registerModule('test', module2);
    
    expect(getModule('test')).toEqual(module2);
  });

  it('should expose global API in browser environment', () => {
    const mockModule = { test: true };
    registerModule('global-test', mockModule);
    
    if (typeof window !== 'undefined') {
      expect((window as any).__fractalModules).toBeDefined();
      expect((window as any).__fractalModules.registerModule).toBeDefined();
      expect((window as any).__fractalModules.getModule('global-test')).toEqual(mockModule);
      expect((window as any).__fractalModules.getModule('non-existent')).toEqual({});
    }
  });

  describe('Edge Cases', () => {
    it('should handle registration with empty object module', () => {
      const emptyModule = {};
      registerModule('empty-module', emptyModule);
      expect(getModule('empty-module')).toEqual({});
    });

    it('should handle registration with complex nested objects', () => {
      const complexModule = {
        level1: {
          level2: {
            level3: {
              data: [1, 2, 3],
              fn: () => 'test'
            }
          }
        },
        circular: null as any
      };
      complexModule.circular = complexModule;
      
      registerModule('complex', complexModule);
      const retrieved = getModule('complex');
      expect(retrieved).toBe(complexModule);
      expect(retrieved.circular).toBe(retrieved);
    });

    it('should handle module names with special characters', () => {
      const module = { test: true };
      const specialNames = [
        'module-with-dash',
        'module_with_underscore',
        'module.with.dots',
        'module@with@at',
        'module$with$dollar',
        'module with spaces',
        '123numeric',
        'UPPERCASE',
        'مرحبا', // Arabic
        '你好', // Chinese
        '🎉emoji🎉'
      ];

      specialNames.forEach(name => {
        expect(() => registerModule(name, module)).not.toThrow();
        expect(getModule(name)).toEqual(module);
      });
    });

    it('should handle very long module names', () => {
      const longName = 'a'.repeat(10000);
      const module = { test: true };
      
      registerModule(longName, module);
      expect(getModule(longName)).toEqual(module);
    });

    it('should handle function modules', () => {
      const fnModule = function testFunction() { return 42; };
      registerModule('function-module', fnModule);
      
      const retrieved = getModule('function-module');
      expect(typeof retrieved).toBe('function');
      expect(retrieved()).toBe(42);
    });

    it('should handle class modules', () => {
      class TestClass {
        value = 42;
        getValue() { return this.value; }
      }
      
      registerModule('class-module', TestClass);
      const RetrievedClass = getModule('class-module');
      const instance = new RetrievedClass();
      expect(instance.getValue()).toBe(42);
    });

    it('should handle Promise modules', () => {
      const promiseModule = Promise.resolve({ data: 'async' });
      registerModule('promise-module', promiseModule);
      
      const retrieved = getModule('promise-module');
      expect(retrieved).toBeInstanceOf(Promise);
    });

    it('should handle Symbol property modules', () => {
      const sym = Symbol('test');
      const module = {
        [sym]: 'symbol value',
        normalProp: 'normal value'
      };
      
      registerModule('symbol-module', module);
      const retrieved = getModule('symbol-module');
      expect(retrieved[sym]).toBe('symbol value');
      expect(retrieved.normalProp).toBe('normal value');
    });

    it('should handle modules with getters and setters', () => {
      let internalValue = 0;
      const module = {
        get value() { return internalValue; },
        set value(v) { internalValue = v; }
      };
      
      registerModule('getter-setter', module);
      const retrieved = getModule('getter-setter');
      
      expect(retrieved.value).toBe(0);
      retrieved.value = 42;
      expect(retrieved.value).toBe(42);
      expect(module.value).toBe(42);
    });

    it('should handle frozen objects', () => {
      const frozenModule = Object.freeze({ frozen: true });
      registerModule('frozen', frozenModule);
      
      const retrieved = getModule('frozen');
      expect(Object.isFrozen(retrieved)).toBe(true);
      expect(retrieved).toBe(frozenModule);
    });

    it('should handle registration of primitives', () => {
      registerModule('string', 'test string');
      registerModule('number', 42);
      registerModule('boolean', true);
      registerModule('bigint', BigInt(9007199254740991));
      
      expect(getModule('string')).toBe('test string');
      expect(getModule('number')).toBe(42);
      expect(getModule('boolean')).toBe(true);
      expect(getModule('bigint')).toBe(BigInt(9007199254740991));
    });

    it('should handle registration with prototype chain', () => {
      class Parent {
        parentMethod() { return 'parent'; }
      }
      
      class Child extends Parent {
        childMethod() { return 'child'; }
      }
      
      const instance = new Child();
      registerModule('inheritance', instance);
      
      const retrieved = getModule('inheritance');
      expect(retrieved.childMethod()).toBe('child');
      expect(retrieved.parentMethod()).toBe('parent');
    });

    it('should handle concurrent registrations', () => {
      const promises = Array.from({ length: 100 }, (_, i) => 
        Promise.resolve().then(() => registerModule(`concurrent-${i}`, { index: i }))
      );
      
      return Promise.all(promises).then(() => {
        for (let i = 0; i < 100; i++) {
          expect(getModule(`concurrent-${i}`)).toEqual({ index: i });
        }
      });
    });

    it('should maintain module identity', () => {
      const module = { test: true };
      registerModule('identity', module);
      
      const retrieved1 = getModule('identity');
      const retrieved2 = getModule('identity');
      
      expect(retrieved1).toBe(retrieved2);
      expect(retrieved1).toBe(module);
    });

    it('should handle modules with toJSON method', () => {
      const module = {
        data: 'test',
        toJSON() {
          return { serialized: true };
        }
      };
      
      registerModule('json-module', module);
      const retrieved = getModule('json-module');
      
      expect(retrieved.data).toBe('test');
      expect(JSON.stringify(retrieved)).toBe('{"serialized":true}');
    });

    it('should handle modules with toString method', () => {
      const module = {
        toString() {
          return 'custom string representation';
        }
      };
      
      registerModule('string-module', module);
      const retrieved = getModule('string-module');
      
      expect(String(retrieved)).toBe('custom string representation');
    });

    it('should handle registration after window.__fractalModules is deleted', () => {
      const originalGlobal = (window as any).__fractalModules;
      delete (window as any).__fractalModules;
      
      const module = { test: true };
      registerModule('after-delete', module);
      expect(getModule('after-delete')).toEqual(module);
      
      // Restore for other tests
      (window as any).__fractalModules = originalGlobal;
    });
  });
});