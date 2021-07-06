import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import {CustomValidators} from 'ngx-custom-validators';
import {AuthService} from '../auth.service';
import {NotifierService} from 'angular-notifier';


@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.scss']
})
export class ForgotComponent implements OnInit {
  public form: FormGroup;
  email: FormControl;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public notifyService: NotifierService,
    ) {
  }

  ngOnInit() {
    this.email = new FormControl('', [Validators.required, Validators.email]);

    this.form = this.fb.group({
      email: this.email
    });
  }

  onSubmit() {
    // const userEmail = this.form.value;
    // this.authService.passwordResetRequest(userEmail.email).subscribe((result) => {
    //   // @ts-ignore
    //   if (result && 'success' === result.status) {
    //     this.notifyService.notify('success', 'THanh cong');
    //   }
    // }, (error) => {
    //   this.notifyService.notify('danger', 'That bai');
    // });
  }
}
