import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { ApiService } from '../../shared/services/api.service';
import { User } from '../../shared/models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockUser: User = {
    id: 1,
    email: 'john@example.com',
    password: 'secret',
    username: 'John'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService]
    });
    localStorage.clear();
  });

  afterEach(() => {
    httpMock?.verify();
    localStorage.clear();
  });

  function initService() {
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  }

  it('should login, set current user, and persist to storage', () => {
    initService();
    let result: User | undefined;

    service.login(mockUser.email, mockUser.password).subscribe(user => (result = user));

    const req = httpMock.expectOne(request => {
      return (
        request.url === 'http://localhost:3000/users' &&
        request.params.get('email') === mockUser.email &&
        request.params.get('password') === mockUser.password
      );
    });
    expect(req.request.method).toBe('GET');
    req.flush([mockUser]);

    expect(result).toEqual(mockUser);
    expect(service.user()).toEqual(mockUser);
    expect(service.isAuthenticated()).toBeTrue();
    expect(localStorage.getItem('suncity-user')).toContain(mockUser.email);
  });

  it('should hydrate from storage on creation', () => {
    localStorage.setItem('suncity-user', JSON.stringify(mockUser));
    initService();
    const hydratedService = service;
    expect(hydratedService.user()?.email).toBe(mockUser.email);
  });

  it('should emit an error when credentials are invalid', done => {
    initService();
    service.login('bad@example.com', 'wrong').subscribe({
      next: () => done.fail('Expected an error'),
      error: err => {
        expect(err).toBeTruthy();
        expect(err.message).toContain('Identifiants invalides');
        done();
      }
    });

    const req = httpMock.expectOne(request => request.url === 'http://localhost:3000/users');
    expect(req.request.params.get('email')).toBe('bad@example.com');
    expect(req.request.params.get('password')).toBe('wrong');
    req.flush([]);
  });

  it('should clear the user on logout and navigate to login', () => {
    initService();
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    localStorage.setItem('suncity-user', JSON.stringify(mockUser));

    // Prime the state with a logged-in user.
    service.login(mockUser.email, mockUser.password).subscribe();
    const req = httpMock.expectOne(request => request.url === 'http://localhost:3000/users');
    req.flush([mockUser]);

    service.logout();

    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    expect(localStorage.getItem('suncity-user')).toBeNull();
  });
});
