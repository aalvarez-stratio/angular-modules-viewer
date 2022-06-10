import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutesGraphComponent } from './routes-graph.component';

describe('ModulesViewerGraphComponent', () => {
  let component: RoutesGraphComponent;
  let fixture: ComponentFixture<RoutesGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoutesGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoutesGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
