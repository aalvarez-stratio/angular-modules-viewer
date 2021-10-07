import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModulesViewerOverviewComponent } from './modules-viewer-overview.component';

describe('ModulesViewerOverviewComponent', () => {
  let component: ModulesViewerOverviewComponent;
  let fixture: ComponentFixture<ModulesViewerOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModulesViewerOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModulesViewerOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
