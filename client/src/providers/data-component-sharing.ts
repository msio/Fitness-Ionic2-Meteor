import { Injectable } from '@angular/core';

@Injectable()
export class DataComponentSharing {

  map:Map<string,any> = new Map();

  constructor() {}

  setValue(key:string,value:any){
    this.map.set(key,value);
  }

  getValue(key:string){
    return this.map.get(key);
  }

  delete(key:string){
    this.map.delete(key);
  }

}
