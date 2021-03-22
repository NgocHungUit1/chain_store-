import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-expiration',
  templateUrl: './expiration.component.html',
  styleUrls: ['./expiration.component.css']
})
export class ExpirationComponent implements OnInit {

  constructor(
    private route: Router,
    private authSer: AuthService, ) {
  }

  ngOnInit(): void {
  }

  home() {
    this.authSer.logout().subscribe(res => {
      if (res) {
        this.route.navigate(['/', 'authentication', 'login']);
      }
    });
  }

}
