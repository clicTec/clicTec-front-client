import { Component, OnInit, inject } from '@angular/core';
import {
  ComparisonDeviceResponse,
  ComparisonFocusOptionResponse,
  ContentApiService,
  FeaturedDuelResponse
} from '../../shared/services/content-api.service';

type FocusId = 'global' | 'camera' | 'performance' | 'battery' | 'value';
type Winner = 'left' | 'right' | 'tie';

interface ComparisonRow {
  readonly label: string;
  readonly leftValue: string;
  readonly rightValue: string;
  readonly winner: Winner;
}

@Component({
  selector: 'app-comparativas-page',
  standalone: true,
  templateUrl: './comparativas-page.html',
  styleUrl: './comparativas-page.scss'
})
export class ComparativasPageComponent implements OnInit {
  private readonly contentApiService = inject(ContentApiService);

  protected isLoading = true;
  protected errorMessage = '';

  protected activeFocusId: FocusId = 'global';
  protected leftDeviceId = '';
  protected rightDeviceId = '';
  protected focusOptions: readonly ComparisonFocusOptionResponse[] = [];
  protected devices: readonly ComparisonDeviceResponse[] = [];
  protected featuredDuels: readonly FeaturedDuelResponse[] = [];

  ngOnInit(): void {
    this.contentApiService.getComparisonPage().subscribe({
      next: (response) => {
        this.focusOptions = response.focusOptions;
        this.devices = response.devices;
        this.featuredDuels = response.featuredDuels;
        this.activeFocusId = response.activeFocusId;
        this.leftDeviceId = response.leftDeviceId;
        this.rightDeviceId = response.rightDeviceId;

        if (!this.leftDevice || !this.rightDevice) {
          this.applyFallbackSelection();
        }

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar comparativas.';
        this.isLoading = false;
      }
    });
  }

  protected get activeFocus(): ComparisonFocusOptionResponse {
    return this.focusOptions.find((focus) => focus.id === this.activeFocusId) ?? {
      id: 'global',
      label: 'Balance general',
      description: ''
    };
  }

  protected get leftDevice(): ComparisonDeviceResponse | undefined {
    return this.devices.find((device) => device.id === this.leftDeviceId);
  }

  protected get rightDevice(): ComparisonDeviceResponse | undefined {
    return this.devices.find((device) => device.id === this.rightDeviceId);
  }

  protected get comparisonRows(): readonly ComparisonRow[] {
    const left = this.leftDevice;
    const right = this.rightDevice;

    if (!left || !right) {
      return [];
    }

    return [
      {
        label: 'Sistema',
        leftValue: left.os,
        rightValue: right.os,
        winner: 'tie'
      },
      {
        label: 'Gama',
        leftValue: left.tier,
        rightValue: right.tier,
        winner: 'tie'
      },
      {
        label: 'Año',
        leftValue: String(left.manufactureYear),
        rightValue: String(right.manufactureYear),
        winner: this.compareHigher(left.manufactureYear, right.manufactureYear)
      },
      {
        label: 'Precio',
        leftValue: left.priceLabel,
        rightValue: right.priceLabel,
        winner: this.compareLower(left.priceValue, right.priceValue)
      },
      {
        label: 'Rendimiento',
        leftValue: `${left.performance.toFixed(1)} / 10`,
        rightValue: `${right.performance.toFixed(1)} / 10`,
        winner: this.compareHigher(left.performance, right.performance)
      },
      {
        label: 'Camara',
        leftValue: `${left.camera.toFixed(1)} / 10`,
        rightValue: `${right.camera.toFixed(1)} / 10`,
        winner: this.compareHigher(left.camera, right.camera)
      },
      {
        label: 'Bateria',
        leftValue: `${left.battery.toFixed(1)} / 10`,
        rightValue: `${right.battery.toFixed(1)} / 10`,
        winner: this.compareHigher(left.battery, right.battery)
      },
      {
        label: 'Capacidad',
        leftValue: `${left.batteryMah} mAh`,
        rightValue: `${right.batteryMah} mAh`,
        winner: this.compareHigher(left.batteryMah, right.batteryMah)
      },
      {
        label: 'Carga',
        leftValue: `${left.chargingW}W`,
        rightValue: `${right.chargingW}W`,
        winner: this.compareHigher(left.chargingW, right.chargingW)
      },
      {
        label: 'Actualizaciones',
        leftValue: `${left.softwareYears} anos`,
        rightValue: `${right.softwareYears} anos`,
        winner: this.compareHigher(left.softwareYears, right.softwareYears)
      },
      {
        label: 'Calidad-precio',
        leftValue: `${left.value.toFixed(1)} / 10`,
        rightValue: `${right.value.toFixed(1)} / 10`,
        winner: this.compareHigher(left.value, right.value)
      }
    ];
  }

  protected get focusWinnerText(): string {
    const left = this.leftDevice;
    const right = this.rightDevice;

    if (!left || !right) {
      return '';
    }

    const leftScore = this.getScoreByFocus(left, this.activeFocusId);
    const rightScore = this.getScoreByFocus(right, this.activeFocusId);

    if (leftScore === rightScore) {
      return 'Empate tecnico en este enfoque. Elige segun precio o preferencias de software.';
    }

    const winner = leftScore > rightScore ? left : right;
    const loser = leftScore > rightScore ? right : left;

    if (this.activeFocusId === 'global') {
      return `${winner.name} gana en balance general frente a ${loser.name}.`;
    }

    return `${winner.name} destaca en ${this.activeFocus.label.toLowerCase()} frente a ${loser.name}.`;
  }

  protected get filteredDuels(): readonly FeaturedDuelResponse[] {
    if (this.activeFocusId === 'global') {
      return this.featuredDuels;
    }

    return this.featuredDuels.filter((duel) => duel.focus === this.activeFocusId);
  }

  protected setFocus(focusId: FocusId): void {
    this.activeFocusId = focusId;
  }

  protected isFocusActive(focusId: FocusId): boolean {
    return this.activeFocusId === focusId;
  }

  protected setLeftDevice(deviceId: string): void {
    if (deviceId === this.rightDeviceId) {
      this.rightDeviceId = this.leftDeviceId;
    }
    this.leftDeviceId = deviceId;
  }

  protected setRightDevice(deviceId: string): void {
    if (deviceId === this.leftDeviceId) {
      this.leftDeviceId = this.rightDeviceId;
    }
    this.rightDeviceId = deviceId;
  }

  protected loadDuel(duel: FeaturedDuelResponse): void {
    this.leftDeviceId = duel.leftDeviceId;
    this.rightDeviceId = duel.rightDeviceId;
    this.activeFocusId = duel.focus;
  }

  private applyFallbackSelection(): void {
    const first = this.devices[0];
    const second = this.devices[1] ?? first;

    if (first) {
      this.leftDeviceId = first.id;
      this.rightDeviceId = second.id;
    }

    if (!this.focusOptions.some((focus) => focus.id === this.activeFocusId)) {
      this.activeFocusId = this.focusOptions[0]?.id ?? 'global';
    }
  }

  private getScoreByFocus(device: ComparisonDeviceResponse, focusId: FocusId): number {
    switch (focusId) {
      case 'camera':
        return device.camera;
      case 'performance':
        return device.performance;
      case 'battery':
        return device.battery;
      case 'value':
        return device.value;
      case 'global':
      default:
        return (device.performance + device.camera + device.battery + device.value) / 4;
    }
  }

  private compareHigher(left: number, right: number): Winner {
    if (left === right) {
      return 'tie';
    }
    return left > right ? 'left' : 'right';
  }

  private compareLower(left: number, right: number): Winner {
    if (left === right) {
      return 'tie';
    }
    return left < right ? 'left' : 'right';
  }
}
