import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTasksStatisticsComponent } from './project-tasks-statistics.component';

describe('ProjectTasksStatisticsComponent', () => {
  let component: ProjectTasksStatisticsComponent;
  let fixture: ComponentFixture<ProjectTasksStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTasksStatisticsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectTasksStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
