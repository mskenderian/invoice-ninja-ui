/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useCallback } from 'react';
import { usePreventNavigation } from '../usePreventNavigation';
import { useShortcutMap } from './useShortcutMap';
import {
  DEFAULT_SHORTCUTS,
  ACTION_ROUTES,
  matchesEvent,
} from './shortcuts';

export function useGlobalShortcuts() {
  const preventNavigation = usePreventNavigation();
  const shortcutMap = useShortcutMap();

  const globalShortcuts = DEFAULT_SHORTCUTS.filter(
    (def) => def.scope === 'global'
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const def of globalShortcuts) {
        const combo = shortcutMap[def.id];

        if (!combo) {
          continue;
        }

        if (matchesEvent(combo, event)) {
          const route = ACTION_ROUTES[def.id];

          if (route) {
            event.preventDefault();
            event.stopPropagation();
            preventNavigation({ url: route });
          }

          return;
        }
      }
    },
    [shortcutMap, preventNavigation]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [handleKeyDown]);
}
