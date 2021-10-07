import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModulesViewerComponent } from './modules-viewer.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxElectronModule } from 'ngx-electron';
import { FormBehaviorModule } from '@stratiods/form-behavior';
import { SpinnerModule } from '@stratiods/spinner';
import { TabModule } from '@stratiods/tab';
import { ModalModule } from '@stratiods/modal';
import { DropdownModule } from '@stratiods/dropdown';
import { KeyboardEmitterModule } from '@stratiods/event-controls';
import { ModulesViewerRoutingModule } from './modules-viewer-routing.module';
import { AssetsGraphModule } from './assets-graph/assets-graph.module';
import { ModulesViewerOverviewModule } from './modules-viewer-overview/modules-viewer-overview.module';



@NgModule({
  declarations: [
    ModulesViewerComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    NgxElectronModule,
    FormBehaviorModule,
    ReactiveFormsModule,
    SpinnerModule,
    ModalModule,
    DropdownModule,
    KeyboardEmitterModule,
    TabModule,
    ModulesViewerRoutingModule,
    AssetsGraphModule,
    ModulesViewerOverviewModule
  ]
})
export class ModulesViewerModule { }
