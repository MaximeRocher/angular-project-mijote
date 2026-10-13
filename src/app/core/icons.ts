import {
  provideTablerIcons,
  IconFlame,
  IconLeaf,
  IconBook,
  IconToolsKitchen2,
  IconStar,
  IconStarFilled,
  IconSearch,
  IconPlus,
  IconTrash,
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconAlertTriangle,
} from '@tabler/icons-angular';
import { EnvironmentProviders } from '@angular/core';

export const APP_TABLER_ICONS = {
  IconFlame,
  IconLeaf,
  IconBook,
  IconToolsKitchen2,
  IconStar,
  IconStarFilled,
  IconSearch,
  IconPlus,
  IconTrash,
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconAlertTriangle,
};

/**
 * Provides all Tabler icons configured for the application.
 */
export function provideAppIcons(): EnvironmentProviders {
  return provideTablerIcons(APP_TABLER_ICONS);
}
