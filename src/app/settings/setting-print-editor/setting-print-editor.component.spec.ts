import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingPrintEditorComponent } from './setting-print-editor.component';

describe('SettingPrintEditorComponent', () => {
  let component: SettingPrintEditorComponent;
  let fixture: ComponentFixture<SettingPrintEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingPrintEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingPrintEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
