import { NgModule } from '@angular/core';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { NgxElectronModule } from 'ngx-electron';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBehaviorModule } from '@stratiods/form-behavior';
import { SpinnerModule } from '@stratiods/spinner';
import { ModalModule } from '@stratiods/modal';
import { DropdownModule } from '@stratiods/dropdown';
import { KeyboardEmitterModule } from '@stratiods/event-controls';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    HomeRoutingModule,
    NgxElectronModule,
    FormBehaviorModule,
    ReactiveFormsModule,
    SpinnerModule,
    ModalModule,
    DropdownModule,
    KeyboardEmitterModule
  ]
})
export class HomeModule {
}
