import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameAvatarIconComponent } from './name-avatar-icon.component';

describe('NameAvatarIconComponent', () => {
  let component: NameAvatarIconComponent;
  let fixture: ComponentFixture<NameAvatarIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NameAvatarIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NameAvatarIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
