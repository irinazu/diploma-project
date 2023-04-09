import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupMaxSizeComponent } from './popup-max-size.component';

describe('PopupMaxSizeComponent', () => {
  let component: PopupMaxSizeComponent;
  let fixture: ComponentFixture<PopupMaxSizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupMaxSizeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupMaxSizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
