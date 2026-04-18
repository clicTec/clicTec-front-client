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
            image: '',
            launchDate: '2024',
            segment: 'Premium',
            os: 'Android',
            tier: 'Alta',
            manufactureYear: 2024,
            priceLabel: 'Desde 799 EUR',
            priceValue: 799,
            chipset: 'Tensor G4',
            antutu: 1000000,
            storageBase: '128 GB',
            ramBase: '12 GB',
            display: 'OLED 120 Hz',
            cameraMain: '50 MP',
            batteryMah: 4700,
            chargingW: 45,
            wirelessCharging: 'Sí',
            softwareYears: 7,
            usbPort: 'USB-C',
            performance: 8.8,
            camera: 9.3,
            battery: 8.5,
            value: 8.2
          },
          {
            id: 'iphone-16e',
            name: 'iPhone 16e',
            brand: 'Apple',
            image: '',
            launchDate: '2025',
            segment: 'Premium compacto',
            os: 'iOS',
            tier: 'Alta',
            manufactureYear: 2025,
            priceLabel: 'Desde 729 EUR',
            priceValue: 729,
            chipset: 'Apple A18',
            antutu: 1200000,
            storageBase: '128 GB',
            ramBase: '8 GB',
            display: 'OLED',
            cameraMain: '48 MP',
            batteryMah: 4300,
            chargingW: 30,
            wirelessCharging: 'Sí',
            softwareYears: 6,
            usbPort: 'USB-C',
            performance: 9.4,
            camera: 8.9,
            battery: 8.2,
            value: 7.8
          }
        ],
        featuredDuels: []
      })
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

  it('renders the interactive comparison content', () => {
    fixture = TestBed.createComponent(ComparativasPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.comparativas-page__title')?.textContent).toContain('Compara móviles');
    expect(compiled.querySelectorAll('.comparativas-device').length).toBe(2);
    expect(compiled.querySelector('.comparativas-verdict')?.textContent).toContain('Google Pixel 9');
  });
});
