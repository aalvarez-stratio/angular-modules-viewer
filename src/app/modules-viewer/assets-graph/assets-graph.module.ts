import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetsGraphComponent } from './assets-graph.component';
import { SpinnerModule } from '@stratiods/spinner';
import { DropdownModule } from '@stratiods/dropdown';
import { KeyboardEmitterModule } from '@stratiods/event-controls';
import { FormBehaviorModule } from '@stratiods/form-behavior';
import { ReactiveFormsModule } from '@angular/forms';
import GraphManagerService from './graph-manager.service';

@NgModule({
  declarations: [
    AssetsGraphComponent
  ],
  exports: [
    AssetsGraphComponent
  ],
  imports: [
    CommonModule,
    SpinnerModule,
    DropdownModule,
    KeyboardEmitterModule,
    FormBehaviorModule,
    ReactiveFormsModule
  ],
  providers: [GraphManagerService]
})
export class AssetsGraphModule { }
