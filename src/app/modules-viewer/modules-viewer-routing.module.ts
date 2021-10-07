import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModulesViewerComponent } from './modules-viewer.component';

const routes: Routes = [
  {
    path: '',
    component: ModulesViewerComponent
  }
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModulesViewerRoutingModule {}
