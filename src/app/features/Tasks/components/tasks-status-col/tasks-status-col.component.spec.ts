import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksStatusColComponent } from './tasks-status-col.component';

describe('TasksStatusColComponent', () => {
  let component: TasksStatusColComponent;
  let fixture: ComponentFixture<TasksStatusColComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksStatusColComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TasksStatusColComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
