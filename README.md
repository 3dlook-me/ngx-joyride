[![npm version](https://badge.fury.io/js/ngx-joyride.svg)](https://badge.fury.io/js/ngx-joyride)
[![Build Status](https://travis-ci.org/tnicola/ngx-joyride.svg?branch=master)](https://travis-ci.org/tnicola/ngx-joyride)
# Angular Joyride
An Angular Tour (Joyride) library built entirely in Angular, without using any heavy external dependencies like Bootstrap or JQuery.
From now on you can easily guide your users through your site showing them all the sections and features.

<p align="center">
	<img src ="https://github.com/tnicola/ngx-joyride/blob/master/docs/joyrideStepExample.PNG" />
</p>

## Demo
See the [demo](https://tnicola.github.io/ngx-joyride/). Let's take a tour! :earth_americas: 

## Install

    npm install ngx-joyride --save
or

    yarn add ngx-joyride

## Usage

 #### 1. Mark your HTML elements with the `joyrideStep` directive

```typescript
  <!-- v. 2.x.x -->
  <h1 joyrideStep="firstStep" title="Page Title" text="Main title!">Text</h1>
  <div joyrideStep="secondStep" title="Page Title" text="Main title!">Div content</div>

  <!-- v. 1.x.x -->
  <h1 joyrideStep title="Page Title" text="Main title!" stepNumber="1">Text</h1>
  <div joyrideStep title="Page Title" text="Main title!" stepNumber="2">Div content</div>

```

  #### 2. Import the `JoyrideModule` in your AppModule
  ```typescript
@NgModule({
	declarations: [AppComponent],
	imports: [
		JoyrideModule,
		BrowserModule
	],
	providers: [],
	bootstrap: [AppComponent]
 })
 export class AppModule { }
 ```
  #### 3. Inject the `JoyrideService` in your Component and start the Tour, passing the steps order list
```typescript
// v. 2.x.x
@Component({
  selector: 'app-component',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private readonly joyrideService: JoyrideService) { }

  onClick() {
    this.joyrideService.startTour(
      { steps: ['firstStep', 'secondStep']} // Your steps order
    );
  }
}

// v. 1.x.x
...
    this.joyrideService.startTour(); // You don't need steps property here.
...
```
  #### 4. En-joy :wink:
  
## Directive Inputs/Outputs
You can use the `joyrideStep` directive with these inputs:

@Input | Required | Purpose  | Values/Type 
---- | ---- | ---- | ---- 
joyrideStep | Yes, (**Only from 2.x.x**) | The step name. This input is required from v. 2.0.0 | string |
stepPosition | No | The position in which the step will be drawn. | 'top', 'right', 'bottom', 'left', 'center'
title | No | The step title. | string 
text |  No | The step text content. | string 
stepContent | No | An Angular template with custom content | TemplateRef\<any>

N.B: Only for the older versions (1.x.x) change `joyrideStep` in `stepNumber`.

@Input | Required | Purpose  | Values/Type
---- | ---- | ---- | ----
stepNumber | Yes **Only for 1.x.x** | The order in which the step should appear during the tour. | 1, ..., n 

@Output | Required | Purpose 
---- | ---- | ----
next (**Only from 2.x.x**) | No | It fires an event when 'Next' button is clicked.
prev (**Only from 2.x.x**) | No | It fires an event when 'Prev' button is clicked.
done (**Only from 2.x.x**) | No | It fires an event when 'Done' button or 'Close' are clicked and the Tour is finished.

	
## Options

Name | Required | Purpose | Type | Default value
---- | ---- | ---- | ---- | ----
steps (**Only from 2.x.x**) | Yes | Represent the ordered list of steps name to show. e.g `steps: ['step1', 'header', 'interesting-table', 'navbar']`. This option is particularly useful for multi-pages navigation. If your step is not in the root path, you should indicate the route after the step name, with a `@` as separator. E.g. : `steps: ['firstStep', 'image@home', 'step4@about/you', 'user-avatar@user/details']` | string[] | none
stepDefaultPosition | No | Define a step default position. The stepPositon set in the directive override this value. | string | bottom
themeColor | No | Backdrop, buttons and title color. (Hexadecimal value) | string | #3b5560
showCounter | No | Show the counter on the bottom-left. | boolean | true
showPrevButton | No | Show the "Prev" button. | boolean | true
logsEnabled | No | Enable logs to see info about the library status. Usuful to get a meaningful error message. | boolean | false

You can change each element step css overriding the default style.

## How tos
### Using Custom Content
If you'd like to use custom HTML content instead of simple text you can use the `stepContent` property instead of `text`. Let's see how.
```html
<div joyrideStep="step1" [stepContent]="customContent">I'm the target element.</div>
<ng-template #customContent>
	... Insert whatever you'd like to ...
</ng-template>
 ```

### How to set the options
```typescript
this.joyrideService.startTour({
    steps: ['step1', 'my-step@home', 'lastStep@home'] // Available from v.2.0.0
    showPrevButton: false,
    stepDefaultPosition: 'top',
    themeColor: '#212f23'
});
 ```

### How to listen for events (Available from v.2.0.0)
**Mode 1: Using directive output events**
```typescript
@Component({
  selector: 'app-component',
  template: `<div joyrideStep="joy1" title="title" (prev)="onPrev()" (next)="onNext()">Hello!</div>
             <div joyrideStep="joy2" title="title2" (done)="onDone()">Hello!</div>`
})
export class AppComponent {
  constructor(private readonly joyrideService: JoyrideService) { }

  onClick() {
    this.joyrideService.startTour(
      { steps: ['joy1', 'joy2']} // Your steps order
    );
  }

  onNext(){
    // Do something
  }

  onPrev() {
    // Do something
  }

  onDone() {
    // Do something
  }
}
```

**Mode 2: Subscribing to startTour**
```typescript
@Component({
  selector: 'app-component',
  template: `<div joyrideStep="joy1" title="title" (prev)="onPrev()" (next)="onNext()">Hello!</div>
             <div joyrideStep="joy2" title="title2" (done)="onDone()">Hello!</div>`
})
export class AppComponent {
  constructor(private readonly joyrideService: JoyrideService) { }

  onClick() {
    this.joyrideService.startTour({ steps: ['joy1', 'joy2']}).subscribe(
      (step) => { /*Do something*/},
      (error) => { /*handle error*/},
      () => { /*Tour is finished here, do something*/}
    );
  }
}
```

### How to get Multi Pages Joyride navigation (Available from v.2.0.0)
If your steps are scattered among different pages you can now reach them, just add their name in the `steps` list followed by `@route/to/page`.

Lets suppose you have three steps: 
* navbar, located in the app root /
* user-avatar, located in /user/details
* info, located in /about

What you should do is adding your steps in this way:
```typescript
...
    this.joyrideService.startTour({steps: ["navbar", "user-avatar@user/details", "info@about"]); 
...
```
**NB**: If you're using lazy modules, you should import the JoyrideModule in your AppModule using `JoyrideModule.forRoot()`. In your lazy loaded feature modules use `JoyrideModule.forChild()` instead. 

## Licence
MIT
