/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useMemo } from 'react';
import { useReactSettings } from '../useReactSettings';
import { DEFAULT_SHORTCUTS } from './shortcuts';

export function useShortcutMap(): Record<string, string | null> {
  const reactSettings = useReactSettings();
  const overrides = reactSettings.keyboard_shortcuts;

  return useMemo(() => {
    const map: Record<string, string | null> = {};

    for (const def of DEFAULT_SHORTCUTS) {
      if (overrides && def.id in overrides) {
        map[def.id] = overrides[def.id];
      } else {
        map[def.id] = def.defaultCombo;
      }
    }

    return map;
  }, [overrides]);
}
