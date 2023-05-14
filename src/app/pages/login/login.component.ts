import { Component, inject } from '@angular/core';
import { Auth, UserCredential, signInWithEmailAndPassword } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase/firebase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginFormGroup = new FormGroup({
    email: new FormControl('', Validators.email),
    password: new FormControl('')
  });
  private auth: Auth = inject(Auth);

  constructor( private route: Router) {

  }

  loginUser() {
    const loginData = this.loginFormGroup.value;
    signInWithEmailAndPassword(this.auth, loginData.email || '', loginData.password || '').then((userCredential: UserCredential) => {
      console.log(userCredential);
      this.route.navigate(['/dashboard'])
    });
  }
}
