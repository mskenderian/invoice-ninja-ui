/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useShortcutMap } from './useShortcutMap';
import { matchesEvent } from './shortcuts';

export function usePageShortcut(
  actionId: string,
  callback: (() => unknown) | null | undefined
) {
  const shortcutMap = useShortcutMap();
  const combo = shortcutMap[actionId];

  useEffect(() => {
    if (!combo || !callback) {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      if (matchesEvent(combo, event)) {
        event.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [combo, callback]);
}
