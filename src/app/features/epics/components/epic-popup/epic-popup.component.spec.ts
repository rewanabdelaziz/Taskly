import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpicPopupComponent } from './epic-popup.component';

describe('EpicPopupComponent', () => {
  let component: EpicPopupComponent;
  let fixture: ComponentFixture<EpicPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpicPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EpicPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
