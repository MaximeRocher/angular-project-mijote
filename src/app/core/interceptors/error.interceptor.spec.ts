import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { errorInterceptor, AppHttpError } from './error.interceptor';

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  const testUrl = '/api/test';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should pass successful HTTP requests unchanged', () => {
    const mockData = { success: true };
    let responseData: unknown;

    httpClient.get(testUrl).subscribe((res) => {
      responseData = res;
    });

    const req = httpTesting.expectOne(testUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);

    expect(responseData).toEqual(mockData);
  });

  it('should transform status 0 into network error AppHttpError', () => {
    let capturedError: AppHttpError | undefined;

    httpClient.get(testUrl).subscribe({
      next: () => {
        throw new Error('Should have failed');
      },
      error: (err: unknown) => {
        if (err instanceof AppHttpError) {
          capturedError = err;
        }
      },
    });

    const req = httpTesting.expectOne(testUrl);
    req.error(new ProgressEvent('error'), { status: 0 });

    expect(capturedError).toBeInstanceOf(AppHttpError);
    expect(capturedError?.status).toBe(0);
    expect(capturedError?.message).toContain('connexion Internet');
  });

  it('should transform status 400 into bad request AppHttpError', () => {
    let capturedError: AppHttpError | undefined;

    httpClient.get(testUrl).subscribe({
      next: () => {
        throw new Error('Should have failed');
      },
      error: (err: unknown) => {
        if (err instanceof AppHttpError) {
          capturedError = err;
        }
      },
    });

    const req = httpTesting.expectOne(testUrl);
    req.flush('Bad request payload', { status: 400, statusText: 'Bad Request' });

    expect(capturedError).toBeInstanceOf(AppHttpError);
    expect(capturedError?.status).toBe(400);
    expect(capturedError?.message).toBe('Bad request payload');
  });

  it('should transform status 401 into session expired AppHttpError', () => {
    let capturedError: AppHttpError | undefined;

    httpClient.get(testUrl).subscribe({
      next: () => {
        throw new Error('Should have failed');
      },
      error: (err: unknown) => {
        if (err instanceof AppHttpError) {
          capturedError = err;
        }
      },
    });

    const req = httpTesting.expectOne(testUrl);
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(capturedError).toBeInstanceOf(AppHttpError);
    expect(capturedError?.status).toBe(401);
    expect(capturedError?.message).toContain('Session expirée');
  });

  it('should transform status 403 into forbidden AppHttpError', () => {
    let capturedError: AppHttpError | undefined;

    httpClient.get(testUrl).subscribe({
      next: () => {
        throw new Error('Should have failed');
      },
      error: (err: unknown) => {
        if (err instanceof AppHttpError) {
          capturedError = err;
        }
      },
    });

    const req = httpTesting.expectOne(testUrl);
    req.flush(null, { status: 403, statusText: 'Forbidden' });

    expect(capturedError).toBeInstanceOf(AppHttpError);
    expect(capturedError?.status).toBe(403);
    expect(capturedError?.message).toContain('Accès refusé');
  });

  it('should transform status 404 into not found AppHttpError', () => {
    let capturedError: AppHttpError | undefined;

    httpClient.get(testUrl).subscribe({
      next: () => {
        throw new Error('Should have failed');
      },
      error: (err: unknown) => {
        if (err instanceof AppHttpError) {
          capturedError = err;
        }
      },
    });

    const req = httpTesting.expectOne(testUrl);
    req.flush(null, { status: 404, statusText: 'Not Found' });

    expect(capturedError).toBeInstanceOf(AppHttpError);
    expect(capturedError?.status).toBe(404);
    expect(capturedError?.message).toContain('introuvable');
  });

  it('should transform status 500 into server error AppHttpError', () => {
    let capturedError: AppHttpError | undefined;

    httpClient.get(testUrl).subscribe({
      next: () => {
        throw new Error('Should have failed');
      },
      error: (err: unknown) => {
        if (err instanceof AppHttpError) {
          capturedError = err;
        }
      },
    });

    const req = httpTesting.expectOne(testUrl);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });

    expect(capturedError).toBeInstanceOf(AppHttpError);
    expect(capturedError?.status).toBe(500);
    expect(capturedError?.message).toContain('Le serveur rencontre actuellement un problème');
  });
});
