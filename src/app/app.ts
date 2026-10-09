import { Component } from '@angular/core';
import { RouteTransition } from './shared/components/route-transition/route-transition';

@Component({
  imports: [RouteTransition],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
