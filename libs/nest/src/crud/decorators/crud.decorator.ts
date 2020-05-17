import { Param, UseInterceptors } from '@nestjs/common';
import { INTERCEPTORS_METADATA, METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { CrudEndpoint } from '../enums/crud-endpoint.enum';
import { CrudRequestInterceptor } from '../interceptors/crud-request.interceptor';
import { CrudDecoratorOptions } from '../interfaces/crud-decorator-options.interface';
import { ClassType } from '../types/class.type';
import { endpointConfigurations } from './endpoint-configurations';
import { ParsedRequest } from './parsed-request.decorator';

function isIdRoute(endpoint: CrudEndpoint) {
    return ![CrudEndpoint.GetMany, CrudEndpoint.PostOne].includes(endpoint);
}

export function Crud(options: CrudDecoratorOptions = {}) {
    return function (target: ClassType) {
        options = {
            endpoints: Object.values(CrudEndpoint),
            ...options,
        };

        // Prepend request interceptor
        const interceptors = Reflect.getMetadata(INTERCEPTORS_METADATA, target) || [];
        UseInterceptors(CrudRequestInterceptor, ...interceptors)(target);

        for (const endpoint of options.endpoints) {
            const config = endpointConfigurations[endpoint];

            // Add controller method
            target.prototype[endpoint] = config.factory(options);

            // Configure request
            Reflect.defineMetadata(PATH_METADATA, config.request.path, target.prototype[endpoint]);
            Reflect.defineMetadata(METHOD_METADATA, config.request.method, target.prototype[endpoint]);

            // Configure param decorators
            ParsedRequest()(target.prototype, endpoint, 0);
            if (isIdRoute(endpoint)) {
                Param('id')(target.prototype, endpoint, 1);
            }
        }
    };
}
