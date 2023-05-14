import { Injectable, inject } from '@angular/core';
import { Auth, User, signOut, user } from '@angular/fire/auth';
import { CollectionReference, DocumentData, DocumentReference, Firestore, addDoc, collection, collectionData, doc, docData, getDoc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UserProfile } from 'src/app/models/user_profile';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);
  user$: Observable<User | null>;
  USERS_COLLECTION: string = "users";

  constructor() {
    this.user$ = user(this.auth);
  }

  getFirebaseUser(): Observable<User | null> {
    return this.user$;
  }

  logoutFirebaseUser(): Promise<void> {
    return signOut(this.auth);
  }

  getCollectionReference(collectionUrl: string): CollectionReference<DocumentData> {
    return collection(this.firestore, collectionUrl);
  }

  addUserProfile(user: Partial<UserProfile>) {
    const userProfileRef = this.getCollectionReference(`${this.USERS_COLLECTION}`);
    addDoc(userProfileRef, user);
  }

  getUserProfile(email: string): Observable<UserProfile[]> {
    const docUrl = `${this.USERS_COLLECTION}`
    const ref = this.getCollectionReference(docUrl) as CollectionReference<UserProfile>;
    const userQuery = query(ref, where("email", "==", email));  
  
    return collectionData(userQuery)
  }
}
