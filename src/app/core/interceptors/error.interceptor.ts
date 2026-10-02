import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { catchError, throwError } from "rxjs";

export class AppHttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly originalError: HttpErrorResponse
  ) {
    super(message);
    this.name = "AppHttpError";
    Object.setPrototypeOf(this, AppHttpError.prototype);
  }
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      let message = "Une erreur inattendue est survenue.";
      let status = 0;

      if (error instanceof HttpErrorResponse) {
        status = error.status;

        if (error.error instanceof ErrorEvent) {
          // Client-side or network error
          message = `Erreur réseau ou client : ${error.error.message}`;
        } else {
          // Server-side error
          switch (error.status) {
            case 0:
              message =
                "Impossible de contacter le serveur. Veuillez vérifier votre connexion Internet.";
              break;
            case 400:
              message =
                typeof error.error === "string" && error.error.trim().length > 0
                  ? error.error
                  : "Requête invalide.";
              break;
            case 401:
              message =
                "Session expirée ou non autorisée. Veuillez vous connecter.";
              break;
            case 403:
              message = "Accès refusé à cette ressource.";
              break;
            case 404:
              message = "La ressource demandée est introuvable.";
              break;
            case 500:
            case 502:
            case 503:
            case 504:
              message =
                "Le serveur rencontre actuellement un problème. Veuillez réessayer plus tard.";
              break;
            default:
              if (typeof error.error === "string" && error.error.trim().length > 0) {
                message = error.error;
              } else if (error.message) {
                message = error.message;
              }
              break;
          }
        }

        console.error(`[HTTP Error ${error.status}] ${req.method} ${req.urlWithParams}:`, message);
        return throwError(() => new AppHttpError(message, status, error));
      }

      if (error instanceof Error) {
        message = error.message;
      }

      console.error(`[HTTP Unexpected Error] ${req.method} ${req.urlWithParams}:`, message);
      return throwError(() => new Error(message));
    })
  );
};
