import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-modules-viewer-overview',
  templateUrl: './modules-viewer-overview.component.html',
  styleUrls: ['./modules-viewer-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModulesViewerOverviewComponent implements OnInit {

  @Input() routes: string[];
  @Input() totalComponents: number;

  constructor() { }

  ngOnInit(): void {
  }

}
