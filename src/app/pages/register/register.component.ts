import { Component, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, UserCredential } from '@angular/fire/auth';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase/firebase.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registrationFormGroup = new FormGroup({
    email: new FormControl('', Validators.email),
    password: new FormControl(''),
    fullName: new FormControl('', Validators.minLength(2)),
    occupation: new FormControl('', Validators.minLength(2))
  })
  private auth: Auth = inject(Auth);

  constructor(private firebaseService: FirebaseService, private route: Router) {

  }

  registerUser() {
    const registrationModel = this.registrationFormGroup.value;
    createUserWithEmailAndPassword(this.auth, registrationModel.email || '', registrationModel.password || '').then((userCredential: UserCredential) => {
      console.log(userCredential.user)
      return this.firebaseService.addUserProfile({
        email: registrationModel.email || '',
        fullName: registrationModel.fullName || '',
        occupation: registrationModel.occupation || ''
      })
    }).then((x) => {
      console.log('successfully added')
      this.route.navigate(["/dashboard"])
    });
  }
}
