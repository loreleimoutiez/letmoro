import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readLocale,rememberLocale} from '../src/adapters/locale.ts';
test('first launch requires an explicit language choice, which persists',()=>{
 const values=new Map<string,string>();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value)}});
 assert.equal(readLocale(),null);rememberLocale('fr');assert.equal(readLocale(),'fr');rememberLocale('en');assert.equal(readLocale(),'en');values.set('letmoro.locale.v1','invalid');assert.equal(readLocale(),null);
});
test('unavailable device storage never silently chooses English',()=>{
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('Unavailable');}});assert.equal(readLocale(),null);
});
