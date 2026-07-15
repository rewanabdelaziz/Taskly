import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEpicComponent } from './add-epic.component';

describe('AddEpicComponent', () => {
  let component: AddEpicComponent;
  let fixture: ComponentFixture<AddEpicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEpicComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddEpicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
