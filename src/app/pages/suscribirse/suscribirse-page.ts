import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  NewsletterService,
  NewsletterSubscriptionResponse
} from '../../shared/services/newsletter.service';

type FormState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-suscribirse-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './suscribirse-page.html',
  styleUrl: './suscribirse-page.scss'
})
export class SuscribirsePageComponent {
  protected readonly emailControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email, Validators.maxLength(255)]
  });

  protected attemptedSubmit = false;
  protected formState: FormState = 'idle';
  protected errorMessage = '';
  protected lastResponse: NewsletterSubscriptionResponse | null = null;

  constructor(private readonly newsletterService: NewsletterService) {}

  protected get isLoading(): boolean {
    return this.formState === 'loading';
  }

  protected get emailErrorMessage(): string {
    if (this.emailControl.hasError('required')) {
      return 'El correo es obligatorio.';
    }

    if (this.emailControl.hasError('email')) {
      return 'Introduce un correo válido.';
    }

    if (this.emailControl.hasError('maxlength')) {
      return 'El correo es demasiado largo.';
    }

    return '';
  }

  protected submit(): void {
    this.attemptedSubmit = true;

    if (this.emailControl.invalid) {
      this.emailControl.markAsTouched();
      return;
    }

    const email = this.emailControl.getRawValue().trim();

    this.formState = 'loading';
    this.errorMessage = '';
    this.lastResponse = null;

    this.newsletterService.subscribe({ email }).subscribe({
      next: (response) => {
        this.formState = 'success';
        this.lastResponse = response;
        this.emailControl.reset('');
        this.emailControl.markAsPristine();
        this.emailControl.markAsUntouched();
        this.attemptedSubmit = false;
      },
      error: (error: HttpErrorResponse) => {
        this.formState = 'error';
        this.errorMessage = this.resolveErrorMessage(error);
      }
    });
  }

  private resolveErrorMessage(error: HttpErrorResponse): string {
    if (!error.error) {
      return 'No se pudo completar la suscripción. Inténtalo de nuevo.';
    }

    if (typeof error.error === 'string') {
      return error.error;
    }

    if (typeof error.error.message === 'string' && error.error.message.length > 0) {
      return error.error.message;
    }

    return 'No se pudo completar la suscripción. Inténtalo de nuevo.';
  }
}
