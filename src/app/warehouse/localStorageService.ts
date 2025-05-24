import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  constructor() { }
  setItem(key: string, value: any) {
    try{
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  }

  getItem<T>(key: string): T | null {
      try{
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.log(error);
        return null;
      }
  }

  removeItem(key: string): void {
    try{
      localStorage.removeItem(key);
    } catch (error) {
      console.log(error);
    }
  }

  hasKey(key: string): boolean {
    return  localStorage.getItem(key) != null;
  }
}
