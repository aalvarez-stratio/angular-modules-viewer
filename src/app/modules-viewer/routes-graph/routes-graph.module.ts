import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutesGraphComponent } from './routes-graph.component';
import { SpinnerModule } from '@stratiods/spinner';
import { DropdownModule } from '@stratiods/dropdown';
import { KeyboardEmitterModule } from '@stratiods/event-controls';
import { FormBehaviorModule } from '@stratiods/form-behavior';
import { ReactiveFormsModule } from '@angular/forms';
import GraphManagerService from '../../shared/graph-manager.service';

@NgModule({
  declarations: [RoutesGraphComponent],
  exports: [RoutesGraphComponent],
  imports: [CommonModule],
  providers: [GraphManagerService]
})
export class RoutesGraphModule { }
