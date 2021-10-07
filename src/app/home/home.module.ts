import { NgModule } from '@angular/core';

import { HomeComponent } from './home.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from '@stratiods/dropdown';
import { KeyboardEmitterModule } from '@stratiods/event-controls';
import { FormBehaviorModule } from '@stratiods/form-behavior';
import { HomeRoutingModule } from './home-routing.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    KeyboardEmitterModule,
    FormBehaviorModule,
    HomeRoutingModule
  ]
})
export class HomeModule {
}
