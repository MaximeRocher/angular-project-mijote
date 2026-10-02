import { NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, FormRoot, required, validate } from '@angular/forms/signals';
import { AuthService } from '../../core/services/auth.service';
import { credentialError } from '../../core/validators/credential.validator';

@Component({
  selector: 'app-login',
  imports: [FormField, FormRoot, NgOptimizedImage],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly model = signal({ login: '', password: '' });

  protected readonly loginForm = form(
    this.model,
    (path) => {
      required(path.login, { message: 'Le login est requis' });
      validate(path.login, ({ value }) => {
        const message = credentialError(value());
        return message ? { kind: 'credential', message } : undefined;
      });

      required(path.password, { message: 'Le mot de passe est requis' });
      validate(path.password, ({ value, valueOf }) => {
        const message = credentialError(value());
        if (message) {
          return { kind: 'credential', message };
        }
        return value() === valueOf(path.login)
          ? undefined
          : { kind: 'mismatch', message: 'Le mot de passe doit être identique au login' };
      });
    },
    {
      submission: {
        action: async () => {
          const { login, password } = this.model();
          const error = this.auth.login(login, password);
          if (error) {
            return { kind: 'login', message: error };
          }
          await this.router.navigate(['/']);
          return undefined;
        },
      },
    },
  );
}
