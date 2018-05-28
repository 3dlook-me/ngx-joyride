import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { JoyrideService } from 'ngx-joyride';

@Component({
  selector: 'demo-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {

  constructor(private readonly joyrideService: JoyrideService) {

  }

  startTour() {
    let options = {
      stepDefaultPosition: 'top',
      themeColor: '#345632',
      showCounter: false,
      showPrevButton: false
    };
    this.joyrideService.startTour(options);
  }
}