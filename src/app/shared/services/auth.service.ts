import { Injectable } from '@angular/core';
import { User } from '../interfaces/vertice.interface';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_KEY = 'registered_users';

  register(user: User): boolean {
    const users = this.getStoredUsers();
    
    if (users.some(u => u.email === user.email)) {
      return false;
    }
    
    users.push(user);
    sessionStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return true;
  }

  login(email: string, password: string): User | null {
    const users = this.getStoredUsers();
    return users.find(u => u.email === email && u.password === password) || null;
  }

  private getStoredUsers(): User[] {
    const usersJSON = sessionStorage.getItem(this.USERS_KEY);
    return usersJSON ? JSON.parse(usersJSON) : [];
  }
}