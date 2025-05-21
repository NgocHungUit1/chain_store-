import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  // Subject with initial value 'false'
  private inSoLo = new Subject<boolean>();
  
  // Observable that components can subscribe to
  isInSoLo$: Observable<boolean> = this.inSoLo.asObservable();

  // Method to update the value
  setInSoLo(isEnabled: boolean): void {
    this.inSoLo.next(isEnabled);
  }
}