import { Component, inject } from '@angular/core';
import { Auth, User, signOut, user } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserProfile } from 'src/app/models/user_profile';
import { FirebaseService } from 'src/app/services/firebase/firebase.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  user$: Observable<User | null>;
  userProfile: UserProfile | null = null;


  constructor(private route: Router, private firebaseService: FirebaseService) {
    this.user$ = this.firebaseService.getFirebaseUser();
    this.user$.subscribe((user: User| null) => {
      console.log(user?.email);
      this.firebaseService.getUserProfile(user?.email || "").subscribe((x: UserProfile[])=> {
        this.userProfile = x[0];
      })
    })
  }

  logout() {
    this.firebaseService.logoutFirebaseUser().then((val: void)=> {
      this.route.navigate(['login']);
      console.log('out you go')
    })
  }

}
