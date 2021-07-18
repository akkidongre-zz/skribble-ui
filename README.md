# Skribble

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.1.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Application architecture

There are 2 main parts in the application, Login and notes.

Login component, header component is implemented in the app module.

Notes is implemented as a lazy loaded module to reduce initial load time of the app.

Login component contains - Email based signin/signup form and login with google option.

Notes module contains - create, edit, view note features along with maps and search functions.

Auth and notes services are used for authentication and actions on notes respectively.

## What could have been better

1. Create component could have been split up and reused as edit form as well.
2. Masonry layout could have been made more efficient.
3. Now, search text is used to filter the notes by type as well and what I have done is a very crude implementation. There could have been separate filters or type field of notes should be thoroughly planned.
4. Repitition of code is present which can be reduced.
5. NgRx is not implemented. It can be implemented.

## Libraries used and why?

1. Angular Material - For all the material design components.
2. Bootstrap - For its, beautiful, near perfect grid system.
3. angularx-social-login - To implement login with google
4. masonry-layout and ngx-masonry - For the auto rearranging card layout like google keep.
5. Leaflet & asymmetrik-ngx-leaflet - To display maps. It is open source.

