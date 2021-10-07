import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { Subject } from 'rxjs';
import GraphManagerService from '../../shared/graph-manager.service';
import { ApplicationGraph } from '../../../../app/typescript-parser/typescript-parser.model';

@Component({
  selector: 'app-routes-graph',
  templateUrl: './routes-graph.component.html',
  styleUrls: ['./routes-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoutesGraphComponent implements OnChanges, OnDestroy {

  @Input() routesGraph: ApplicationGraph;

  private _componentDestroyed$: Subject<void> = new Subject<void>();

  constructor(private _graphManager: GraphManagerService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.routesGraph?.currentValue) {
      this._processProjectGraph(changes.routesGraph.currentValue);
    }
  }

  public ngOnDestroy(): void {
    this._componentDestroyed$.next();
    this._componentDestroyed$.complete();
    this._componentDestroyed$.unsubscribe();
  }

  private _processProjectGraph(results: ApplicationGraph): void {
    const container = document.getElementById('routes-graph');
    this._graphManager.setGraph(results.nodes, results.edges, container);

    console.log('NODES --> ' + results.nodes.length);
    console.log('EDGES --> ' + results.edges.length);
  }
}
