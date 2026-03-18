import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyComments } from './my-comments';

describe('MyComments', () => {
  let component: MyComments;
  let fixture: ComponentFixture<MyComments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComments],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
