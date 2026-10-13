import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialCitas } from './historial-citas';

describe('HistorialCitas', () => {
  let component: HistorialCitas;
  let fixture: ComponentFixture<HistorialCitas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialCitas],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialCitas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
