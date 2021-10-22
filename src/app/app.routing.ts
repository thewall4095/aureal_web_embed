import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmbedComponent } from './embed/embed.component';

const routes: Routes = [
    { path: ':episode_id',    component: EmbedComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled',
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
