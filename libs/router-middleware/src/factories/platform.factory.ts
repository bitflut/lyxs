import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Platform } from '@frrri/router-middleware/internal';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FRRRI_MIDDLEWARE, FRRRI_OPERATIONS } from '../constants';
import { toObservable } from '../helpers/is-observable';

type OptionalArray<T = any> = T | T[];

export function PlatformFactory(platform: Platform) {
    @Injectable()
    abstract class PlatformAbstract<T = any> implements Resolve<OptionalArray<T>> {

        constructor(protected injector: Injector) { }

        getOperations(route: ActivatedRouteSnapshot) {
            return route.data[FRRRI_OPERATIONS]
                ?.filter(operation => operation.platforms.includes(platform));
        }

        getMiddlewares() {
            return this.injector.get(FRRRI_MIDDLEWARE)
                ?.filter(middleware => middleware.supportedPlatforms.includes(platform));
        }

        getOperations$(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
            const operations = this.getOperations(route) ?? [];
            const operations$: Observable<any>[] = [];
            operations.forEach(operation =>
                this.getMiddlewares()
                    .forEach(resolver => {
                        const resolved = resolver.operate(operation, platform, route, state);
                        operations$.push(
                            toObservable(resolved).pipe(map(result => ({ operation, result }))),
                        );
                    }),
            );

            return operations$;
        }

        resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OptionalArray<T>> | Promise<OptionalArray<T>> | OptionalArray<T> {
            const operations$ = this.getOperations$(route, state);
            if (!operations$.length) { return; }
            return forkJoin(operations$);
        }

    }

    return PlatformAbstract;
}
