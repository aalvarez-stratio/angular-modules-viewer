import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModulesViewerOverviewComponent } from './modules-viewer-overview.component';



@NgModule({
    declarations: [
        ModulesViewerOverviewComponent
    ],
    exports: [
        ModulesViewerOverviewComponent
    ],
    imports: [
        CommonModule
    ]
})
export class ModulesViewerOverviewModule { }
