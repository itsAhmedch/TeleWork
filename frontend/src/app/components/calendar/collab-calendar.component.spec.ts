import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollabCalendarComponent } from './collab-calendar.component';

describe('CollabCalendarComponent', () => {
  let component: CollabCalendarComponent;
  let fixture: ComponentFixture<CollabCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollabCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollabCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
