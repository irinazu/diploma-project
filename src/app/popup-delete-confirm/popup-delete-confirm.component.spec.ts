import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDeleteConfirmComponent } from './popup-delete-confirm.component';

describe('PopupDeleteConfirmComponent', () => {
  let component: PopupDeleteConfirmComponent;
  let fixture: ComponentFixture<PopupDeleteConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupDeleteConfirmComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDeleteConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
