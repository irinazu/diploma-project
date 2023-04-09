import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertainChatComponent } from './certain-chat.component';

describe('CertainChatComponent', () => {
  let component: CertainChatComponent;
  let fixture: ComponentFixture<CertainChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertainChatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertainChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
