import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn } from '@angular/router';
import { RouteTransitionService } from '../services/route-transition.service';

/**
 * Functional guard that pauses Angular route activation while the
 * transition curtain smoothly covers the screen. Returns true only
 * once the screen is fully masked, ensuring zero DOM jumping.
 */
export const transitionGuard: CanActivateFn & CanActivateChildFn = () => {
  const service = inject(RouteTransitionService);
  return service.playCover();
};
