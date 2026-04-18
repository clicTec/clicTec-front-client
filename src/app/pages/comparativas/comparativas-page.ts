import { Component, OnInit, inject } from '@angular/core';
import {
  ComparisonDeviceResponse,
  ComparisonFocusOptionResponse,
  ContentApiService,
  FeaturedDuelResponse
} from '../../shared/services/content-api.service';

type FocusId = 'global' | 'camera' | 'performance' | 'battery' | 'value';
type Side = 'left' | 'right';
type BetterSide = Side | 'tie';
type MetricMode = 'higher' | 'lower' | 'binary' | 'soft';

interface DeviceGroup {
  readonly brand: string;
  readonly devices: readonly ComparisonDeviceResponse[];
}

interface ScoreCard {
  readonly id: Exclude<FocusId, 'global'>;
  readonly label: string;
  readonly leftScore: number;
  readonly rightScore: number;
  readonly winner: BetterSide;
}

interface MetricRow {
  readonly id: string;
  readonly label: string;
  readonly leftValue: string;
  readonly rightValue: string;
  readonly winner: BetterSide;
  readonly note: string;
}

@Component({
  selector: 'app-comparativas-page',
  standalone: true,
  templateUrl: './comparativas-page.html',
  styleUrl: './comparativas-page.scss'
})
export class ComparativasPageComponent implements OnInit {
  private readonly contentApiService = inject(ContentApiService);
  private readonly integerFormatter = new Intl.NumberFormat('es-ES');
  private readonly currencyFormatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  });

  protected isLoading = true;
  protected errorMessage = '';
  protected selectedFocusId: FocusId = 'global';
  protected leftDeviceId = '';
  protected rightDeviceId = '';
  protected focusOptions: readonly ComparisonFocusOptionResponse[] = [];
  protected devices: readonly ComparisonDeviceResponse[] = [];
  protected featuredDuels: readonly FeaturedDuelResponse[] = [];
  protected deviceGroups: readonly DeviceGroup[] = [];

  ngOnInit(): void {
    this.contentApiService.getComparisonPage().subscribe({
      next: (page) => {
        this.focusOptions = page.focusOptions;
        this.devices = page.devices;
        this.featuredDuels = page.featuredDuels;
        this.deviceGroups = this.buildDeviceGroups(page.devices);
        this.selectedFocusId = page.activeFocusId;
        this.leftDeviceId = this.resolveDeviceId(page.leftDeviceId, page.devices, 0);
        this.rightDeviceId = this.resolveDeviceId(page.rightDeviceId, page.devices, 1, this.leftDeviceId);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se ha podido cargar el comparador.';
        this.isLoading = false;
      }
    });
  }

  protected get selectedFocus(): ComparisonFocusOptionResponse | undefined {
    return this.focusOptions.find((focus) => focus.id === this.selectedFocusId);
  }

  protected get leftDevice(): ComparisonDeviceResponse | undefined {
    return this.devices.find((device) => device.id === this.leftDeviceId);
  }

  protected get rightDevice(): ComparisonDeviceResponse | undefined {
    return this.devices.find((device) => device.id === this.rightDeviceId);
  }

  protected get deviceCount(): number {
    return this.devices.length;
  }

  protected get brandCount(): number {
    return new Set(this.devices.map((device) => device.brand)).size;
  }

  protected get summaryWinner(): { side: BetterSide; title: string; detail: string } {
    const leftDevice = this.leftDevice;
    const rightDevice = this.rightDevice;

    if (!leftDevice || !rightDevice) {
      return {
        side: 'tie',
        title: 'Comparación lista',
        detail: 'Selecciona dos móviles para ver el veredicto por foco.'
      };
    }

    const leftScore = this.getFocusScore(leftDevice, this.selectedFocusId);
    const rightScore = this.getFocusScore(rightDevice, this.selectedFocusId);
    const winner = this.compareNumbers(leftScore, rightScore, 'higher');

    if (winner === 'tie') {
      return {
        side: 'tie',
        title: 'Duelo muy igualado',
        detail: `En ${this.selectedFocus?.label.toLowerCase() ?? 'este enfoque'} ambos están prácticamente empatados.`
      };
    }

    const winningDevice = winner === 'left' ? leftDevice : rightDevice;
    return {
      side: winner,
      title: `${winningDevice.brand} ${winningDevice.name.replace(`${winningDevice.brand} `, '')}`.trim(),
      detail: `Toma ventaja en ${this.selectedFocus?.label.toLowerCase() ?? 'el análisis'} con ${this.formatScore(
        Math.max(leftScore, rightScore)
      )}/10.`
    };
  }

  protected get priceDeltaText(): string {
    const leftDevice = this.leftDevice;
    const rightDevice = this.rightDevice;

    if (!leftDevice || !rightDevice) {
      return 'Sin selección';
    }

    const delta = Math.abs(leftDevice.priceValue - rightDevice.priceValue);
    if (delta === 0) {
      return 'Mismo precio de lanzamiento';
    }

    const cheaperDevice = leftDevice.priceValue <= rightDevice.priceValue ? leftDevice : rightDevice;
    return `${cheaperDevice.brand} ${cheaperDevice.name.replace(`${cheaperDevice.brand} `, '')} cuesta ${this.currencyFormatter.format(
      delta
    )} menos`;
  }

  protected get headlineDifference(): string {
    const leftDevice = this.leftDevice;
    const rightDevice = this.rightDevice;

    if (!leftDevice || !rightDevice) {
      return 'Activa un duelo para ver diferencias clave.';
    }

    const strongerPerformance = this.compareNumbers(leftDevice.antutu, rightDevice.antutu, 'higher');
    const biggerBattery = this.compareNumbers(leftDevice.batteryMah, rightDevice.batteryMah, 'higher');

    if (strongerPerformance !== 'tie') {
      const winningDevice = strongerPerformance === 'left' ? leftDevice : rightDevice;
      const losingDevice = strongerPerformance === 'left' ? rightDevice : leftDevice;
      const delta = Math.abs(leftDevice.antutu - rightDevice.antutu);
      return `${winningDevice.name} saca ${this.integerFormatter.format(delta)} puntos Antutu frente a ${losingDevice.name}.`;
    }

    if (biggerBattery !== 'tie') {
      const winningDevice = biggerBattery === 'left' ? leftDevice : rightDevice;
      return `${winningDevice.name} ofrece la batería más generosa del duelo.`;
    }

    return 'Los dos perfiles están bastante equilibrados en especificaciones clave.';
  }

  protected get scoreCards(): readonly ScoreCard[] {
    const leftDevice = this.leftDevice;
    const rightDevice = this.rightDevice;

    if (!leftDevice || !rightDevice) {
      return [];
    }

    const cards: ScoreCard[] = [
      { id: 'performance', label: 'Rendimiento', leftScore: leftDevice.performance, rightScore: rightDevice.performance, winner: 'tie' },
      { id: 'camera', label: 'Cámara', leftScore: leftDevice.camera, rightScore: rightDevice.camera, winner: 'tie' },
      { id: 'battery', label: 'Batería', leftScore: leftDevice.battery, rightScore: rightDevice.battery, winner: 'tie' },
      { id: 'value', label: 'Valor', leftScore: leftDevice.value, rightScore: rightDevice.value, winner: 'tie' }
    ];

    return cards.map((card) => ({
      ...card,
      winner: this.compareNumbers(card.leftScore, card.rightScore, 'higher')
    }));
  }

  protected get metricRows(): readonly MetricRow[] {
    const leftDevice = this.leftDevice;
    const rightDevice = this.rightDevice;

    if (!leftDevice || !rightDevice) {
      return [];
    }

    return [
      this.createMetricRow(
        'price',
        'Precio de salida',
        leftDevice.priceLabel,
        rightDevice.priceLabel,
        leftDevice.priceValue,
        rightDevice.priceValue,
        'lower',
        'Comparo PVP de lanzamiento, no precio de oferta puntual.'
      ),
      this.createMetricRow(
        'launch',
        'Lanzamiento',
        leftDevice.launchDate,
        rightDevice.launchDate,
        leftDevice.manufactureYear,
        rightDevice.manufactureYear,
        'higher',
        'La fecha ayuda a entender soporte y generación.'
      ),
      this.createMetricRow(
        'antutu',
        'Antutu',
        this.integerFormatter.format(leftDevice.antutu),
        this.integerFormatter.format(rightDevice.antutu),
        leftDevice.antutu,
        rightDevice.antutu,
        'higher',
        'Indica potencia agregada para tareas pesadas.'
      ),
      this.createMetricRow(
        'storage',
        'Almacenamiento base',
        leftDevice.storageBase,
        rightDevice.storageBase,
        this.extractFirstInteger(leftDevice.storageBase),
        this.extractFirstInteger(rightDevice.storageBase),
        'higher',
        'Capacidad inicial sin pagar un salto de memoria.'
      ),
      this.createMetricRow(
        'ram',
        'RAM base',
        leftDevice.ramBase,
        rightDevice.ramBase,
        this.extractFirstInteger(leftDevice.ramBase),
        this.extractFirstInteger(rightDevice.ramBase),
        'higher',
        'Más RAM suele dar más margen en multitarea.'
      ),
      this.createMetricRow(
        'display',
        'Pantalla',
        leftDevice.display,
        rightDevice.display,
        this.scoreDisplay(leftDevice.display),
        this.scoreDisplay(rightDevice.display),
        'higher',
        'Valoro panel, tamaño útil y tasa de refresco.'
      ),
      this.createMetricRow(
        'camera',
        'Cámaras',
        leftDevice.cameraMain,
        rightDevice.cameraMain,
        leftDevice.camera,
        rightDevice.camera,
        'higher',
        'El sistema raw se acompaña de la nota de cámara.'
      ),
      this.createMetricRow(
        'battery',
        'Batería',
        `${this.integerFormatter.format(leftDevice.batteryMah)} mAh`,
        `${this.integerFormatter.format(rightDevice.batteryMah)} mAh`,
        leftDevice.batteryMah,
        rightDevice.batteryMah,
        'higher',
        'Más capacidad suele dar más colchón, aunque no siempre más autonomía real.'
      ),
      this.createMetricRow(
        'charge',
        'Carga rápida',
        `${leftDevice.chargingW} W`,
        `${rightDevice.chargingW} W`,
        leftDevice.chargingW,
        rightDevice.chargingW,
        'higher',
        'Aquí manda la potencia declarada de carga.'
      ),
      this.createMetricRow(
        'wireless',
        'Carga inalámbrica',
        leftDevice.wirelessCharging,
        rightDevice.wirelessCharging,
        this.scoreBinary(leftDevice.wirelessCharging),
        this.scoreBinary(rightDevice.wirelessCharging),
        'binary',
        'Un plus de comodidad en escritorios y coche.'
      ),
      this.createMetricRow(
        'software',
        'Años de actualización',
        `${leftDevice.softwareYears} años`,
        `${rightDevice.softwareYears} años`,
        leftDevice.softwareYears,
        rightDevice.softwareYears,
        'higher',
        'Más soporte suele alargar mejor la vida útil.'
      ),
      this.createMetricRow(
        'usb',
        'Puerto USB',
        leftDevice.usbPort,
        rightDevice.usbPort,
        this.scoreUsb(leftDevice.usbPort),
        this.scoreUsb(rightDevice.usbPort),
        'higher',
        'La versión influye en velocidad de datos y vídeo.'
      )
    ];
  }

  protected activateFocus(focusId: FocusId): void {
    this.selectedFocusId = focusId;
  }

  protected selectDevice(side: Side, nextDeviceId: string): void {
    if (!nextDeviceId || nextDeviceId === (side === 'left' ? this.leftDeviceId : this.rightDeviceId)) {
      return;
    }

    if (side === 'left') {
      if (nextDeviceId === this.rightDeviceId) {
        this.rightDeviceId = this.leftDeviceId;
      }
      this.leftDeviceId = nextDeviceId;
      return;
    }

    if (nextDeviceId === this.leftDeviceId) {
      this.leftDeviceId = this.rightDeviceId;
    }
    this.rightDeviceId = nextDeviceId;
  }

  protected swapDevices(): void {
    if (!this.leftDeviceId || !this.rightDeviceId) {
      return;
    }

    const previousLeft = this.leftDeviceId;
    this.leftDeviceId = this.rightDeviceId;
    this.rightDeviceId = previousLeft;
  }

  protected applyFeaturedDuel(duel: FeaturedDuelResponse): void {
    this.selectedFocusId = duel.focus;
    this.leftDeviceId = duel.leftDeviceId;
    this.rightDeviceId = duel.rightDeviceId;
  }

  protected trackFocus(_: number, focus: ComparisonFocusOptionResponse): string {
    return focus.id;
  }

  protected trackGroup(_: number, group: DeviceGroup): string {
    return group.brand;
  }

  protected trackDevice(_: number, device: ComparisonDeviceResponse): string {
    return device.id;
  }

  protected trackScoreCard(_: number, card: ScoreCard): string {
    return card.id;
  }

  protected trackMetric(_: number, metric: MetricRow): string {
    return metric.id;
  }

  protected trackDuel(_: number, duel: FeaturedDuelResponse): string {
    return duel.id;
  }

  protected getFocusScore(device: ComparisonDeviceResponse, focusId: FocusId): number {
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

  protected formatScore(value: number): string {
    return value.toFixed(1);
  }

  protected getDeviceInitial(device: ComparisonDeviceResponse | undefined): string {
    if (!device) {
      return '?';
    }
    return device.brand.charAt(0).toUpperCase();
  }

  private resolveDeviceId(
    preferredId: string,
    devices: readonly ComparisonDeviceResponse[],
    fallbackIndex: number,
    excludedId = ''
  ): string {
    if (preferredId && devices.some((device) => device.id === preferredId)) {
      return preferredId;
    }

    const fallback = devices.find((device, index) => index >= fallbackIndex && device.id !== excludedId);
    return fallback?.id ?? '';
  }

  private buildDeviceGroups(devices: readonly ComparisonDeviceResponse[]): readonly DeviceGroup[] {
    const grouped = new Map<string, ComparisonDeviceResponse[]>();

    devices.forEach((device) => {
      const bucket = grouped.get(device.brand) ?? [];
      bucket.push(device);
      grouped.set(device.brand, bucket);
    });

    return [...grouped.entries()].map(([brand, groupedDevices]) => ({
      brand,
      devices: groupedDevices
    }));
  }

  private createMetricRow(
    id: string,
    label: string,
    leftValue: string,
    rightValue: string,
    leftNumeric: number,
    rightNumeric: number,
    mode: MetricMode,
    note: string
  ): MetricRow {
    return {
      id,
      label,
      leftValue,
      rightValue,
      winner: this.compareNumbers(leftNumeric, rightNumeric, mode),
      note
    };
  }

  private compareNumbers(leftValue: number, rightValue: number, mode: MetricMode): BetterSide {
    if (Math.abs(leftValue - rightValue) < 0.0001) {
      return 'tie';
    }

    if (mode === 'lower') {
      return leftValue < rightValue ? 'left' : 'right';
    }

    return leftValue > rightValue ? 'left' : 'right';
  }

  private extractFirstInteger(value: string): number {
    const match = value.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  private scoreDisplay(value: string): number {
    const normalized = value.toLowerCase();
    const refreshRate = Number(normalized.match(/(\d+)\s*hz/)?.[1] ?? '60');
    const diagonal = Number(normalized.match(/(\d+(?:\.\d+)?)"/)?.[1] ?? '6');
    const panelScore = normalized.includes('amoled') || normalized.includes('oled')
      ? 24
      : normalized.includes('lcd')
        ? 10
        : 14;

    return (refreshRate * 10) + Math.round(diagonal * 10) + panelScore;
  }

  private scoreBinary(value: string): number {
    return value.toLowerCase().startsWith('s') ? 1 : 0;
  }

  private scoreUsb(value: string): number {
    const normalized = value.toLowerCase();
    if (normalized.includes('3.2')) {
      return 32;
    }
    if (normalized.includes('3.1')) {
      return 31;
    }
    if (normalized.includes('3.0')) {
      return 30;
    }
    if (normalized.includes('2.0')) {
      return 20;
    }
    if (normalized.includes('lightning')) {
      return 15;
    }
    if (normalized.includes('micro')) {
      return 10;
    }
    return 0;
  }
}
