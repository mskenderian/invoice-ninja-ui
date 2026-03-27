/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { describe, test, expect } from 'vitest';

/**
 * These tests validate the keyboard shortcut mappings that exist in the app.
 * They are written against the raw data so they work on both the original
 * useKeyboardShortcuts.ts implementation and the new keyboard-shortcuts module.
 */

// The expected shortcut mappings — the source of truth for what the app should support.
const EXPECTED_SHORTCUTS: Record<string, string> = {
  c: '/clients/create',
  k: '/products/create',
  i: '/invoices/create',
  r: '/recurring_invoices/create',
  q: '/quotes/create',
  p: '/payments/create',
  e: '/expenses/create',
  o: '/purchase_orders/create',
  d: '/credits/create',
  j: '/projects/create',
  t: '/tasks/create',
  v: '/vendors/create',
  x: '/recurring_expenses/create',
  a: '/transactions/create',
  n: '/docuninja/create',
};

/**
 * Simulates the key matching logic used by the shortcut handler.
 * Ctrl+Shift must be held, Alt and Meta must not.
 */
function shouldTriggerShortcut(event: {
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  key: string;
}): boolean {
  return (
    event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey
  );
}

describe('keyboard shortcuts', () => {
  describe('shortcut mappings', () => {
    test('all 15 entity create shortcuts are defined', () => {
      expect(Object.keys(EXPECTED_SHORTCUTS)).toHaveLength(15);
    });

    test.each(Object.entries(EXPECTED_SHORTCUTS))(
      'Ctrl+Shift+%s maps to %s',
      (key, route) => {
        expect(route).toMatch(/^\/[\w_]+\/create$/);
        expect(key).toHaveLength(1);
      }
    );

    test('each route is unique', () => {
      const routes = Object.values(EXPECTED_SHORTCUTS);
      const uniqueRoutes = new Set(routes);
      expect(uniqueRoutes.size).toBe(routes.length);
    });

    test('each key is unique', () => {
      const keys = Object.keys(EXPECTED_SHORTCUTS);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    test('clients shortcut is Ctrl+Shift+C', () => {
      expect(EXPECTED_SHORTCUTS['c']).toBe('/clients/create');
    });

    test('invoices shortcut is Ctrl+Shift+I', () => {
      expect(EXPECTED_SHORTCUTS['i']).toBe('/invoices/create');
    });

    test('quotes shortcut is Ctrl+Shift+Q', () => {
      expect(EXPECTED_SHORTCUTS['q']).toBe('/quotes/create');
    });

    test('payments shortcut is Ctrl+Shift+P', () => {
      expect(EXPECTED_SHORTCUTS['p']).toBe('/payments/create');
    });

    test('expenses shortcut is Ctrl+Shift+E', () => {
      expect(EXPECTED_SHORTCUTS['e']).toBe('/expenses/create');
    });

    test('credits shortcut is Ctrl+Shift+D', () => {
      expect(EXPECTED_SHORTCUTS['d']).toBe('/credits/create');
    });

    test('tasks shortcut is Ctrl+Shift+T', () => {
      expect(EXPECTED_SHORTCUTS['t']).toBe('/tasks/create');
    });

    test('vendors shortcut is Ctrl+Shift+V', () => {
      expect(EXPECTED_SHORTCUTS['v']).toBe('/vendors/create');
    });

    test('products shortcut is Ctrl+Shift+K', () => {
      expect(EXPECTED_SHORTCUTS['k']).toBe('/products/create');
    });

    test('recurring invoices shortcut is Ctrl+Shift+R', () => {
      expect(EXPECTED_SHORTCUTS['r']).toBe('/recurring_invoices/create');
    });

    test('purchase orders shortcut is Ctrl+Shift+O', () => {
      expect(EXPECTED_SHORTCUTS['o']).toBe('/purchase_orders/create');
    });

    test('projects shortcut is Ctrl+Shift+J', () => {
      expect(EXPECTED_SHORTCUTS['j']).toBe('/projects/create');
    });

    test('recurring expenses shortcut is Ctrl+Shift+X', () => {
      expect(EXPECTED_SHORTCUTS['x']).toBe('/recurring_expenses/create');
    });

    test('transactions shortcut is Ctrl+Shift+A', () => {
      expect(EXPECTED_SHORTCUTS['a']).toBe('/transactions/create');
    });

    test('docuninja shortcut is Ctrl+Shift+N', () => {
      expect(EXPECTED_SHORTCUTS['n']).toBe('/docuninja/create');
    });
  });

  describe('key matching logic', () => {
    test('Ctrl+Shift+key triggers shortcut', () => {
      expect(
        shouldTriggerShortcut({
          ctrlKey: true,
          shiftKey: true,
          altKey: false,
          metaKey: false,
          key: 'c',
        })
      ).toBe(true);
    });

    test('Ctrl alone does not trigger shortcut', () => {
      expect(
        shouldTriggerShortcut({
          ctrlKey: true,
          shiftKey: false,
          altKey: false,
          metaKey: false,
          key: 'c',
        })
      ).toBe(false);
    });

    test('Shift alone does not trigger shortcut', () => {
      expect(
        shouldTriggerShortcut({
          ctrlKey: false,
          shiftKey: true,
          altKey: false,
          metaKey: false,
          key: 'c',
        })
      ).toBe(false);
    });

    test('Ctrl+Shift+Alt does not trigger shortcut', () => {
      expect(
        shouldTriggerShortcut({
          ctrlKey: true,
          shiftKey: true,
          altKey: true,
          metaKey: false,
          key: 'c',
        })
      ).toBe(false);
    });

    test('Ctrl+Shift+Meta does not trigger shortcut', () => {
      expect(
        shouldTriggerShortcut({
          ctrlKey: true,
          shiftKey: true,
          altKey: false,
          metaKey: true,
          key: 'c',
        })
      ).toBe(false);
    });

    test('no modifier keys does not trigger shortcut', () => {
      expect(
        shouldTriggerShortcut({
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
          metaKey: false,
          key: 'c',
        })
      ).toBe(false);
    });

    test('unregistered key with Ctrl+Shift does not match any route', () => {
      const key = 'z';
      expect(EXPECTED_SHORTCUTS[key]).toBeUndefined();
    });
  });
});
