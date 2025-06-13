import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

globalThis.fetch = vi.fn();
globalThis.React = { createElement: vi.fn() } as any;
globalThis.react = globalThis.React;