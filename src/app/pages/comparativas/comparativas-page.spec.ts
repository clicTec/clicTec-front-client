import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComparativasPageComponent } from './comparativas-page';

describe('ComparativasPageComponent', () => {
  let fixture: ComponentFixture<ComparativasPageComponent> | null = null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparativasPageComponent]
    }).compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
    fixture = null;
    vi.useRealTimers();
  });

  it('renders the countdown for Wednesday 8 April 2026 at 17:00', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-08T12:00:00+02:00'));

    fixture = TestBed.createComponent(ComparativasPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.countdown-unit').length).toBe(4);
    expect(compiled.querySelector('.comparativas-page__countdown')?.getAttribute('aria-label')).toContain(
      '8 de abril de 2026'
    );
    expect(compiled.querySelector('.comparativas-page__countdown')?.getAttribute('aria-label')).toContain('17:00');
  });
});
