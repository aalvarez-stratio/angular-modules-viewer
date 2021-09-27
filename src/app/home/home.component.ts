import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ProjectDataService } from '../shared/state/project-data.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnDestroy {

  public packageJsonControl: FormControl = new FormControl('/home/aalvarez/Proyectos/governance-ui/package.json');
  public tsConfigControl: FormControl = new FormControl('/home/aalvarez/Proyectos/governance-ui/tsconfig.json');

  private _componentDestroyed$: Subject<void> = new Subject<void>();

  constructor(
    public router: Router,
    private _projectData: ProjectDataService
  ) {}

  public ngOnDestroy(): void {
    this._componentDestroyed$.next();
    this._componentDestroyed$.complete();
    this._componentDestroyed$.unsubscribe();
  }

  public processPath(): void {
    this._projectData.setIsReady();
    this._projectData.analyzeProject({
      tsConfigPath: this.tsConfigControl.value,
      packageJsonPath: this.packageJsonControl.value
    });
    this.router.navigate(['modules-viewer']).then();
  }
}
