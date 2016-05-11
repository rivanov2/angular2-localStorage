import {Type, provide, ComponentRef, Injectable, OnDestroy, NgZone} from '@angular/core';

export class LocalStorageEmitter {

    protected static subscribed = [];
    protected static ngZones:NgZone[] = [];

    public static register(ngZone:NgZone) {
        let index:number = LocalStorageEmitter.ngZones.indexOf(ngZone);
        if (index === -1) {
            index = LocalStorageEmitter.ngZones.push(ngZone) - 1;
        }
        LocalStorageEmitter.subscribed[index] = ngZone.onMicrotaskEmpty.subscribe(() => {
            for (let callback of LocalStorageEmitter.subscribers) {
                callback();
            }
        });
    }

    protected static subscribers = [];

    public static subscribe(callback:Function) {
        LocalStorageEmitter.subscribers.push(callback);
    }

    public static unregister(ngZone:NgZone) {
        let index:number = LocalStorageEmitter.ngZones.indexOf(ngZone);
        if (index >= 0) {
            LocalStorageEmitter.subscribed[index].unsubscribe();
        }
    }
}

@Injectable()
export class LocalStorageService implements OnDestroy {
    constructor(private ngZone:NgZone) {
        LocalStorageEmitter.register(this.ngZone);
    }

    ngOnDestroy() {
        LocalStorageEmitter.unregister(this.ngZone);
    }
}

export function LocalStorageSubscriber(appPromise:Promise<ComponentRef<LocalStorageService>>) {
    appPromise.then((bla) => {
        bla.injector.get(<Type>LocalStorageService);
    });
}
