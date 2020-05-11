# Routing Instructions

**@lyxs/angular/routing** aims at making it easy to configure your components data layer via the **angular router**. This way, your components are highly reusable and can display different sets of data for different routes easily.

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { crudRouteInstructions, crudRoutes, getActive, getMany } from '@lyxs/angular/routing';

const routes: Routes = [
    {
        path: '',
        data: crudRouteInstructions({
            'entities': clear(), // Clear all entities when entering the route
            'entities.posts': getMany() // Then get posts
        })
    },
    {
        path: ':id',
        data: crudRouteInstructions({
            'entities.posts': getActive() // Get active post (defaults to set param :id active)
        })
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(
            crudRoutes(routes) // Important so route instructions can be resolved
        )
    ],
    exports: [RouterModule]
})
export class PostsRoutingModule { }
```

Have a look at [posts-routing.module.ts](https://github.com/bitflut/lyxs/blob/master/apps/ng-integration/src/app/posts/posts-routing.module.ts) in the **ng-intergation example** on GitHub for more examples.
