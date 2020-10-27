import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import {AuthService} from "../auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public form: FormGroup;
  wrong = false;
  wrongMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authSer: AuthService,
  ) {}

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
  }

  onSubmit() {
    this.login();
  }

  login() {
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
