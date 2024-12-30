import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { catchError, Observable } from 'rxjs';
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

      async fetchConfigData() {
      this.endPointService.getEndpoint().pipe(
        catchError((error) => {
          throw error
        })
      ).subscribe(data => {
        this.configData = data;
      });
    }

    async canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): Promise<boolean | UrlTree> {
      if (!this.configData) {
        await this.fetchConfigData();
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
        return publicRoute ? true : this.router.parseUrl('/landing');
      }
    }
}
