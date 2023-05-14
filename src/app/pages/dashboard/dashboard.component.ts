import { Component } from '@angular/core';
import { User } from '@angular/fire/auth';
import { UserProfile } from 'src/app/models/user_profile';
import { FirebaseService } from 'src/app/services/firebase/firebase.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  userProfile: UserProfile | null = null;

  constructor(private firebaseService: FirebaseService) {
    this.firebaseService.user$.subscribe((user: User | null) => {
      if (!user) return;

      this.firebaseService.getUserProfile(user?.email || "").subscribe((x: UserProfile[])=> {
        this.userProfile = x[0];
      })
      
    })
   
  }
}
