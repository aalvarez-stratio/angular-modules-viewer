import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsGraphComponent } from './assets-graph.component';

describe('ModulesViewerGraphComponent', () => {
  let component: AssetsGraphComponent;
  let fixture: ComponentFixture<AssetsGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetsGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
