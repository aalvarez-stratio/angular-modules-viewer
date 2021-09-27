import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModulesViewerComponent } from './modules-viewer.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxElectronModule } from 'ngx-electron';
import { FormBehaviorModule } from '@stratiods/form-behavior';
import { SpinnerModule } from '@stratiods/spinner';
import { ModalModule } from '@stratiods/modal';
import { DropdownModule } from '@stratiods/dropdown';
import { KeyboardEmitterModule } from '@stratiods/event-controls';



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
    KeyboardEmitterModule
  ]
})
export class ModulesViewerModule { }
