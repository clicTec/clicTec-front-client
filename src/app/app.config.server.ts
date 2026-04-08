import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { API_BASE_URL } from './shared/config/api-base.token';

const serverApiBaseUrl =
  (process.env['PRERENDER_API_BASE'] ?? process.env['API_UPSTREAM'] ?? 'http://localhost:8080').replace(
    /\/$/,
    ''
  );

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: API_BASE_URL,
      useValue: serverApiBaseUrl
    }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
