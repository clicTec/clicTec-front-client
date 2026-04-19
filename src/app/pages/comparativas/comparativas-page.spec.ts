import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ComparativasPageComponent } from './comparativas-page';
import { ContentApiService } from '../../shared/services/content-api.service';

describe('ComparativasPageComponent', () => {
  let fixture: ComponentFixture<ComparativasPageComponent> | null = null;

  const contentApiServiceStub = {
    getComparisonPage: vi.fn(() =>
      of({
        activeFocusId: 'camera',
        leftDeviceId: 'pixel-9',
        rightDeviceId: 'iphone-16e',
        focusOptions: [
          {
            id: 'camera',
            label: 'Cámara',
            description: 'Prioriza detalle, color y consistencia.'
          }
        ],
        devices: [
          {
            id: 'pixel-9',
            name: 'Google Pixel 9',
            brand: 'Google',
            segment: 'Premium',
            os: 'Android',
            tier: 'Alta',
            manufactureYear: 2024,
            priceLabel: 'Desde 799 EUR',
            priceValue: 799,
            chipset: 'Tensor G4',
            cameraMain: '50 MP',
            batteryMah: 4700,
            chargingW: 45,
            softwareYears: 7,
            performance: 8.8,
            camera: 9.3,
            battery: 8.5,
            value: 8.2
          },
          {
            id: 'iphone-16e',
            name: 'iPhone 16e',
            brand: 'Apple',
            segment: 'Premium compacto',
            os: 'iOS',
            tier: 'Alta',
            manufactureYear: 2025,
            priceLabel: 'Desde 729 EUR',
            priceValue: 729,
            chipset: 'Apple A18',
            cameraMain: '48 MP',
            batteryMah: 4300,
            chargingW: 30,
            softwareYears: 6,
            performance: 9.4,
            camera: 8.9,
            battery: 8.2,
            value: 7.8
          }
        ],
        featuredDuels: []
      } as any)
    )
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparativasPageComponent],
      providers: [{ provide: ContentApiService, useValue: contentApiServiceStub }]
    }).compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
    fixture = null;
    contentApiServiceStub.getComparisonPage.mockClear();
  });

  it('renders the comparator when the API omits optional comparison fields', () => {
    fixture = TestBed.createComponent(ComparativasPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.comparativas-hero__title')?.textContent).toContain(
      'Cruza precio, potencia y cámara'
    );
    expect(compiled.querySelectorAll('.device-panel').length).toBe(2);
    expect(compiled.querySelectorAll('.metric-row').length).toBeGreaterThan(0);
    expect(compiled.textContent).not.toContain('No se pudo abrir el comparador');
  });
});
