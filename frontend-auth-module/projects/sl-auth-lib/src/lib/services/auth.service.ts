import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ApiBaseService } from './base-api/api-base.service';
import { EndpointService } from './endpoint/endpoint.service';
import { ToastService } from './toast/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { ModelComponent } from '../components/shared/component/model/model.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;
  baseApiService: ApiBaseService;
  endPointService: EndpointService;
  router: Router;
  configData: any;
  toastService: ToastService;
  dialog: MatDialog;

  constructor() {
    this.baseApiService = inject(ApiBaseService);
    this.endPointService = inject(EndpointService);
    this.router = inject(Router);
    this.fetchConfigData();
    this.toastService = inject(ToastService);
    this.dialog = inject(MatDialog);
  }

  async fetchConfigData() {
    this.endPointService.getEndpoint().pipe(
      catchError((error) => {
        this.toastService.showToast('An error occurred while fetching configData', 'error', 3000, 'top', 'end')
        throw error
      })
    ).subscribe(data => {
      this.configData = data;
    });
  }

  login(): boolean {
    if (localStorage.getItem('name')) {
      this.loggedIn = true;
      return true;
    }
    return false;
  }

  async logout() {
    const dialogRef = this.dialog.open(ModelComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loggedIn = false;
        const payload = {
          refresh_token: localStorage?.getItem('refToken')
        };

        this.baseApiService
          .post(
            this.configData?.baseUrl,
            this.configData?.logoutApiPath,
            payload
          ).pipe(
            catchError((error) => {
              this.toastService.showToast(error?.error?.message || `An error occurred during logout`, 'error', 3000, 'top', 'end');
              throw error;
            })
          )
          .subscribe(
            (res: any) => {
              if (res?.responseCode === "OK") {
                localStorage.clear();
                this.sendMessage();
                  this.router.navigate(['/login']);
              } else {
                this.toastService.showToast(res?.message || `Logout unsuccessful`, 'error', 3000, 'top', 'end');
              }
            }
          );
      }
    });
  }

  sendMessage() {
    const message = { msg:'logout successful' };
    window.postMessage(message, '*');
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }
}
