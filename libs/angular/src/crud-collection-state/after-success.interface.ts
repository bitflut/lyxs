import { OperationContext } from '@lyxs/angular/internal';
import { Observable } from 'rxjs';

export interface AfterSuccess<Entity = any> {

    /**
     * Will be run after every successful operation. A good use case for this is to render json-ld elements
     * on the server platform for SEO purposes.
     */
    afterSuccess(data: Entity | Entity[], operation: OperationContext): void | Observable<any>;

}