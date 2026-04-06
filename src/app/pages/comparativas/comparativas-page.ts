import { Component, OnDestroy, OnInit } from '@angular/core';

interface CountdownUnit {
  readonly label: string;
  readonly value: string;
}

const COMPARATOR_LAUNCH_DATE = '2026-04-08T17:00:00+02:00';

@Component({
  selector: 'app-comparativas-page',
  standalone: true,
  templateUrl: './comparativas-page.html',
  styleUrl: './comparativas-page.scss'
})
export class ComparativasPageComponent implements OnInit, OnDestroy {
  private readonly targetDate = new Date(COMPARATOR_LAUNCH_DATE);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  protected readonly countdownAriaLabel = this.createCountdownAriaLabel();
  protected countdownUnits: readonly CountdownUnit[] = [];
  protected isFinished = false;

  ngOnInit(): void {
    this.updateCountdown();
    this.intervalId = setInterval(() => this.updateCountdown(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }
  }

  private updateCountdown(): void {
    const now = new Date();
    const remainingMs = this.targetDate.getTime() - now.getTime();

    if (remainingMs <= 0) {
      this.isFinished = true;
      this.countdownUnits = [
        { label: 'Días', value: '00' },
        { label: 'Horas', value: '00' },
        { label: 'Minutos', value: '00' },
        { label: 'Segundos', value: '00' }
      ];
      return;
    }

    this.isFinished = false;

    const totalSeconds = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    this.countdownUnits = [
      { label: 'Días', value: this.formatUnit(days) },
      { label: 'Horas', value: this.formatUnit(hours) },
      { label: 'Minutos', value: this.formatUnit(minutes) },
      { label: 'Segundos', value: this.formatUnit(seconds) }
    ];
  }

  private formatUnit(value: number): string {
    return String(value).padStart(2, '0');
  }

  private createCountdownAriaLabel(): string {
    return `Cuenta atrás hasta el ${new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Madrid'
    }).format(this.targetDate)}`;
  }
}
