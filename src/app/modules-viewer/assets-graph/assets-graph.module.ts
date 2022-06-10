import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetsGraphComponent } from './assets-graph.component';
import { DropdownModule } from '@stratiods/dropdown';
import { KeyboardEmitterModule } from '@stratiods/event-controls';
import { FormBehaviorModule } from '@stratiods/form-behavior';
import { ReactiveFormsModule } from '@angular/forms';
import GraphManagerService from '../../shared/graph-manager.service';

@NgModule({
  declarations: [
    AssetsGraphComponent
  ],
  exports: [
    AssetsGraphComponent
  ],
  imports: [
    CommonModule,
    DropdownModule,
    KeyboardEmitterModule,
    FormBehaviorModule,
    ReactiveFormsModule
  ],
  providers: [GraphManagerService]
})
export class AssetsGraphModule { }
