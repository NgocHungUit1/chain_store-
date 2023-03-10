import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import {AuthService} from '../auth.service';
import {StoreService} from '../../store/store.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public form: FormGroup;
  wrong = false;
  wrongMessage = '';
  logo = 'assets/images/logo-chrome-192x192.png';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authSer: AuthService,
    private storeSer: StoreService,
  ) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      uname: [null, Validators.compose([Validators.required])],
      password: [null, Validators.compose([Validators.required])]
    });
    this.authSer.checkStatus().subscribe(x => {
      if (x) {
        this.router.navigate(['/']).then(() => {
          window.location.reload();
        });
      }
    });
    this.storeSer.getLogo().subscribe(res => {
      if (res !== null && res.length > 0) {
        this.logo = res;
      }
    });
  }

  onSubmit() {
    this.login();
  }

  login() {
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      return;
    }

    this.authSer.login(this.form.controls['uname'].value, this.form.controls['password'].value, true)
      .subscribe(response => {
        if (!response.success) {
          this.wrong = true;
          this.wrongMessage = response.message;
        } else {
          this.authSer.setToken(response.token);
          this.router.navigate(['/']).then(() => {
            window.location.reload();
          });
        }
      });
  }
}
