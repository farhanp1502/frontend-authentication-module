import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { catchError, EMPTY, Observable } from 'rxjs';
import { EndpointService } from '../endpoint/endpoint.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  configData:any;

  private readonly publicRoutes = ['/login', '/signup', '/landing', '/otp', '/reset-password'];

  private readonly excludedRoutes = ['/mohini','/create-project']

  constructor(private router: Router,private endPointService:EndpointService) {}

  private isPublicRoute(url: string): boolean {
    return this.publicRoutes.includes(url);
  }

  private isAuthenticated(): boolean {
    return !!localStorage.getItem('name');
  }

  fetchConfigData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.endPointService.getEndpoint().pipe(
        catchError((error) => {
          reject(error);
          return EMPTY;
        })
      ).subscribe(data => {
        this.configData = data;
        resolve();
      });
      });
    }

    async canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): Promise<boolean | UrlTree> {
      if (!this.configData) {
      try {
        await this.fetchConfigData();
      } catch (error) {
        return this.router.parseUrl('/home');
      }
      }

      const url = state.url;
      const authenticated = this.isAuthenticated();
      const publicRoute = this.isPublicRoute(url);

      const initialRedirectDone = localStorage.getItem('initialRedirectDone') === 'true';

      if (this.excludedRoutes.includes(url)) {
        return true;
      }

      if (authenticated && this.configData?.initialPagePath && !initialRedirectDone) {
        localStorage.setItem('initialRedirectDone', 'true'); // Persist flag across refreshes
        return this.router.parseUrl(this.configData?.initialPagePath);
      }


      if (authenticated) {
        return publicRoute ? this.router.parseUrl('/home') : true;
      } else {
      if (this.configData?.initialPagePath) {
        return publicRoute ? true : this.router.parseUrl(this.configData?.initialPagePath);
      } else {
        return publicRoute ? true : this.router.parseUrl('/landing');
      }
    }
}
}
