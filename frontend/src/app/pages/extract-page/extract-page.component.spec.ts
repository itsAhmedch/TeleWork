import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtractPageComponent } from './extract-page.component';

describe('ExtractPageComponent', () => {
  let component: ExtractPageComponent;
  let fixture: ComponentFixture<ExtractPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtractPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtractPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
