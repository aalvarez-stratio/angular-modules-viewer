import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeRoutingModule } from './home/home-routing.module';
import { ModulesViewerRoutingModule } from './modules-viewer/modules-viewer-routing.module';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
    HomeRoutingModule,
    ModulesViewerRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
