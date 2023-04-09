import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupChatComponent } from './popup-chat.component';

describe('PopupChatComponent', () => {
  let component: PopupChatComponent;
  let fixture: ComponentFixture<PopupChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupChatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
