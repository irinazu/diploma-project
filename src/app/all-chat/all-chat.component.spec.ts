import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllChatComponent } from './all-chat.component';

describe('AllChatComponent', () => {
  let component: AllChatComponent;
  let fixture: ComponentFixture<AllChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllChatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
