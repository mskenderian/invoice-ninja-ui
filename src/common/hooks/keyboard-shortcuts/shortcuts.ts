/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export type ShortcutScope = 'global' | 'page';

export interface ShortcutDefinition {
  id: string;
  defaultCombo: string;
  label: string;
  scope: ShortcutScope;
}

export const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
  { id: 'save', defaultCombo: 'Ctrl+S', label: 'save', scope: 'page' },
  {
    id: 'create:client',
    defaultCombo: 'Ctrl+Shift+C',
    label: 'new_client',
    scope: 'global',
  },
  {
    id: 'create:product',
    defaultCombo: 'Ctrl+Shift+K',
    label: 'new_product',
    scope: 'global',
  },
  {
    id: 'create:invoice',
    defaultCombo: 'Ctrl+Shift+I',
    label: 'new_invoice',
    scope: 'global',
  },
  {
    id: 'create:recurring_invoice',
    defaultCombo: 'Ctrl+Shift+R',
    label: 'new_recurring_invoice',
    scope: 'global',
  },
  {
    id: 'create:quote',
    defaultCombo: 'Ctrl+Shift+Q',
    label: 'new_quote',
    scope: 'global',
  },
  {
    id: 'create:payment',
    defaultCombo: 'Ctrl+Shift+P',
    label: 'new_payment',
    scope: 'global',
  },
  {
    id: 'create:expense',
    defaultCombo: 'Ctrl+Shift+E',
    label: 'new_expense',
    scope: 'global',
  },
  {
    id: 'create:purchase_order',
    defaultCombo: 'Ctrl+Shift+O',
    label: 'new_purchase_order',
    scope: 'global',
  },
  {
    id: 'create:credit',
    defaultCombo: 'Ctrl+Shift+D',
    label: 'new_credit',
    scope: 'global',
  },
  {
    id: 'create:project',
    defaultCombo: 'Ctrl+Shift+J',
    label: 'new_project',
    scope: 'global',
  },
  {
    id: 'create:task',
    defaultCombo: 'Ctrl+Shift+T',
    label: 'new_task',
    scope: 'global',
  },
  {
    id: 'create:vendor',
    defaultCombo: 'Ctrl+Shift+V',
    label: 'new_vendor',
    scope: 'global',
  },
  {
    id: 'create:recurring_expense',
    defaultCombo: 'Ctrl+Shift+X',
    label: 'new_recurring_expense',
    scope: 'global',
  },
  {
    id: 'create:transaction',
    defaultCombo: 'Ctrl+Shift+A',
    label: 'new_transaction',
    scope: 'global',
  },
  {
    id: 'create:docuninja',
    defaultCombo: 'Ctrl+Shift+N',
    label: 'new_document',
    scope: 'global',
  },
];

export const ACTION_ROUTES: Record<string, string> = {
  'create:client': '/clients/create',
  'create:product': '/products/create',
  'create:invoice': '/invoices/create',
  'create:recurring_invoice': '/recurring_invoices/create',
  'create:quote': '/quotes/create',
  'create:payment': '/payments/create',
  'create:expense': '/expenses/create',
  'create:purchase_order': '/purchase_orders/create',
  'create:credit': '/credits/create',
  'create:project': '/projects/create',
  'create:task': '/tasks/create',
  'create:vendor': '/vendors/create',
  'create:recurring_expense': '/recurring_expenses/create',
  'create:transaction': '/transactions/create',
  'create:docuninja': '/docuninja/create',
};

interface ParsedCombo {
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  key: string;
}

export function parseCombo(combo: string): ParsedCombo {
  const parts = combo.toLowerCase().split('+');

  return {
    ctrlKey: parts.includes('ctrl'),
    shiftKey: parts.includes('shift'),
    altKey: parts.includes('alt'),
    metaKey: parts.includes('meta'),
    key: parts[parts.length - 1],
  };
}

export function matchesEvent(combo: string, event: KeyboardEvent): boolean {
  const parsed = parseCombo(combo);

  const ctrlOrMeta = event.ctrlKey || event.metaKey;

  return (
    ctrlOrMeta === parsed.ctrlKey &&
    event.shiftKey === parsed.shiftKey &&
    event.altKey === parsed.altKey &&
    event.key.toLowerCase() === parsed.key
  );
}
