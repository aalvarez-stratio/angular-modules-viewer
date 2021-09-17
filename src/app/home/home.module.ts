import { NgModule } from '@angular/core';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { NgxElectronModule } from 'ngx-electron';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBehaviorModule } from '@circe/form-behavior';
import { SpinnerModule } from '@circe/spinner';

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
    SpinnerModule
  ]
})
export class HomeModule {}
