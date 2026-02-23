import { Component } from '@angular/core';

type FocusId = 'global' | 'camera' | 'performance' | 'battery' | 'value';
type Winner = 'left' | 'right' | 'tie';

interface FocusOption {
  readonly id: FocusId;
  readonly label: string;
  readonly description: string;
}

interface ComparisonDevice {
  readonly id: string;
  readonly name: string;
  readonly brand: string;
  readonly segment: string;
  readonly priceLabel: string;
  readonly priceValue: number;
  readonly chipset: string;
  readonly cameraMain: string;
  readonly batteryMah: number;
  readonly chargingW: number;
  readonly softwareYears: number;
  readonly performance: number;
  readonly camera: number;
  readonly battery: number;
  readonly value: number;
}

interface ComparisonRow {
  readonly label: string;
  readonly leftValue: string;
  readonly rightValue: string;
  readonly winner: Winner;
}

interface FeaturedDuel {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly tag: string;
  readonly focus: FocusId;
  readonly leftDeviceId: string;
  readonly rightDeviceId: string;
}

@Component({
  selector: 'app-comparativas-page',
  standalone: true,
  templateUrl: './comparativas-page.html',
  styleUrl: './comparativas-page.scss'
})
export class ComparativasPageComponent {
  protected activeFocusId: FocusId = 'global';

  protected leftDeviceId = 'pixel-9';
  protected rightDeviceId = 'galaxy-a56';

  protected readonly focusOptions: readonly FocusOption[] = [
    {
      id: 'global',
      label: 'Balance general',
      description: 'Vista total para elegir el movil mas equilibrado en uso diario.'
    },
    {
      id: 'camera',
      label: 'Camara',
      description: 'Prioriza detalle, color y consistencia en foto y video.'
    },
    {
      id: 'performance',
      label: 'Rendimiento',
      description: 'Compara potencia sostenida para apps pesadas y juegos.'
    },
    {
      id: 'battery',
      label: 'Bateria',
      description: 'Analiza autonomia real, eficiencia y velocidad de carga.'
    },
    {
      id: 'value',
      label: 'Calidad-precio',
      description: 'Detecta el movil que entrega mas por cada euro invertido.'
    }
  ];

  protected readonly devices: readonly ComparisonDevice[] = [
    {
      id: 'pixel-9',
      name: 'Google Pixel 9',
      brand: 'Google',
      segment: 'Premium',
      priceLabel: 'Desde 799 EUR',
      priceValue: 799,
      chipset: 'Tensor G4',
      cameraMain: '50 MP + ultra wide',
      batteryMah: 4700,
      chargingW: 45,
      softwareYears: 7,
      performance: 8.8,
      camera: 9.3,
      battery: 8.5,
      value: 8.2
    },
    {
      id: 'galaxy-a56',
      name: 'Samsung Galaxy A56',
      brand: 'Samsung',
      segment: 'Calidad-precio',
      priceLabel: 'Desde 499 EUR',
      priceValue: 499,
      chipset: 'Exynos 1580',
      cameraMain: '50 MP OIS',
      batteryMah: 5000,
      chargingW: 45,
      softwareYears: 6,
      performance: 8.3,
      camera: 8.4,
      battery: 8.8,
      value: 9.1
    },
    {
      id: 'iphone-16e',
      name: 'iPhone 16e',
      brand: 'Apple',
      segment: 'Premium compacto',
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
    },
    {
      id: 'xiaomi-14t',
      name: 'Xiaomi 14T',
      brand: 'Xiaomi',
      segment: 'Calidad-precio',
      priceLabel: 'Desde 579 EUR',
      priceValue: 579,
      chipset: 'Dimensity 9300+',
      cameraMain: '50 MP OIS',
      batteryMah: 5000,
      chargingW: 120,
      softwareYears: 5,
      performance: 9.0,
      camera: 8.6,
      battery: 8.7,
      value: 8.8
    },
    {
      id: 'oneplus-13r',
      name: 'OnePlus 13R',
      brand: 'OnePlus',
      segment: 'Alta',
      priceLabel: 'Desde 649 EUR',
      priceValue: 649,
      chipset: 'Snapdragon 8 Gen 3',
      cameraMain: '50 MP Sony LYT',
      batteryMah: 5500,
      chargingW: 100,
      softwareYears: 4,
      performance: 9.2,
      camera: 8.1,
      battery: 9.1,
      value: 8.5
    },
    {
      id: 'nothing-3a-pro',
      name: 'Nothing Phone 3a Pro',
      brand: 'Nothing',
      segment: 'Media',
      priceLabel: 'Desde 469 EUR',
      priceValue: 469,
      chipset: 'Snapdragon 7s Gen 3',
      cameraMain: '50 MP OIS',
      batteryMah: 5000,
      chargingW: 50,
      softwareYears: 4,
      performance: 7.9,
      camera: 8.0,
      battery: 8.4,
      value: 8.7
    }
  ];

  protected readonly featuredDuels: readonly FeaturedDuel[] = [
    {
      id: 'pixel-vs-iphone',
      title: 'Pixel 9 vs iPhone 16e',
      summary: 'Duelos de foto nocturna, video y ecosistema en formato compacto.',
      tag: 'Foto y experiencia',
      focus: 'camera',
      leftDeviceId: 'pixel-9',
      rightDeviceId: 'iphone-16e'
    },
    {
      id: 'a56-vs-14t',
      title: 'Galaxy A56 vs Xiaomi 14T',
      summary: 'La comparativa mas consultada en gama media-alta por precio.',
      tag: 'Calidad-precio',
      focus: 'value',
      leftDeviceId: 'galaxy-a56',
      rightDeviceId: 'xiaomi-14t'
    },
    {
      id: '14t-vs-13r',
      title: 'Xiaomi 14T vs OnePlus 13R',
      summary: 'Rendimiento sostenido, temperatura y carga ultra rapida.',
      tag: 'Gaming y potencia',
      focus: 'performance',
      leftDeviceId: 'xiaomi-14t',
      rightDeviceId: 'oneplus-13r'
    },
    {
      id: 'a56-vs-nothing',
      title: 'Galaxy A56 vs Nothing Phone 3a Pro',
      summary: 'Software, bateria y equilibrio para uso diario intensivo.',
      tag: 'Uso diario',
      focus: 'battery',
      leftDeviceId: 'galaxy-a56',
      rightDeviceId: 'nothing-3a-pro'
    }
  ];

  protected get activeFocus(): FocusOption {
    return this.focusOptions.find((focus) => focus.id === this.activeFocusId) ?? this.focusOptions[0];
  }

  protected get leftDevice(): ComparisonDevice | undefined {
    return this.devices.find((device) => device.id === this.leftDeviceId);
  }

  protected get rightDevice(): ComparisonDevice | undefined {
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

  protected get filteredDuels(): readonly FeaturedDuel[] {
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

  protected loadDuel(duel: FeaturedDuel): void {
    this.leftDeviceId = duel.leftDeviceId;
    this.rightDeviceId = duel.rightDeviceId;
    this.activeFocusId = duel.focus;
  }

  private getScoreByFocus(device: ComparisonDevice, focusId: FocusId): number {
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
