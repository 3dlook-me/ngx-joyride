import { Injectable } from '@angular/core';
import { JoyrideStepService } from "./joyride-step.service";
import { JoyrideOptionsService } from '../services/joyride-options.service';
import { JoyrideOptions } from '../models/joyride-options.class';
import { Observable } from 'rxjs/Observable';
import { JoyrideStepInfo } from '../models/joyride-step-info.class';

@Injectable()
export class JoyrideService {

    constructor(
        private readonly stepService: JoyrideStepService,
        private readonly optionsService: JoyrideOptionsService
    ) { }

    startTour(options?: JoyrideOptions): Observable<JoyrideStepInfo> {
        if (options) {
            this.optionsService.setOptions(options);
        }
        return this.stepService.startTour();
    }

}