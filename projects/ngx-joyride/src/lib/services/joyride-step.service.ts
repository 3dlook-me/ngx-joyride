import { Injectable } from '@angular/core';
import { JoyrideStep } from '../models/joyride-step.class';
import { JoyrideBackdropService } from './joyride-backdrop.service';
import { EventListenerService } from './event-listener.service';
import { JoyrideStepsContainerService, StepActionType } from './joyride-steps-container.service';
import { DocumentService } from './document.service';
import { StepDrawerService } from './step-drawer.service';
import { DomRefService } from './dom.service';
import { NO_POSITION } from '../directives/joyride.directive';
import { JoyrideOptionsService } from './joyride-options.service';
import { Router } from '@angular/router';
import { ReplaySubject, Observable, timer } from 'rxjs';
import { JoyrideStepInfo } from '../models/joyride-step-info.class';
import { JoyrideStepDoesNotExist, JoyrideStepOutOfRange } from '../models/joyride-error.class';
import { LoggerService } from './logger.service';

const SCROLLBAR_SIZE = 20;

export const DISTANCE_FROM_TARGET = 15;
export const ARROW_SIZE = 10;

export interface IJoyrideStepService {
    startTour(): Observable<JoyrideStepInfo>;
    close(): any;
    prev(): any;
    next(): any;
}

@Injectable()
export class JoyrideStepService implements IJoyrideStepService {
    private currentStep: JoyrideStep;
    private winTopPosition: number = 0;
    private winBottomPosition: number = 0;
    private stepsObserver: ReplaySubject<JoyrideStepInfo> = new ReplaySubject<JoyrideStepInfo>();

    constructor(
        private readonly backDropService: JoyrideBackdropService,
        private readonly eventListener: EventListenerService,
        private readonly stepsContainerService: JoyrideStepsContainerService,
        private readonly documentService: DocumentService,
        private readonly DOMService: DomRefService,
        private readonly stepDrawerService: StepDrawerService,
        private readonly optionsService: JoyrideOptionsService,
        private readonly router: Router,
        private readonly logger: LoggerService
    ) {
        this.initViewportPositions();
        this.subscribeToScrollEvents();
        this.subscribeToResizeEvents();
    }

    private initViewportPositions() {
        this.winTopPosition = 0;
        this.winBottomPosition = this.DOMService.getNativeWindow().innerHeight - SCROLLBAR_SIZE;
    }

    private subscribeToScrollEvents() {
        this.eventListener.startListeningScrollEvents();
        this.eventListener.scrollEvent.subscribe(scroll => {
            this.winTopPosition = scroll.scrollY;
            this.winBottomPosition = this.winTopPosition + this.DOMService.getNativeWindow().innerHeight - SCROLLBAR_SIZE;
            if (this.currentStep) this.backDropService.redraw(this.currentStep, scroll);
        });
    }

    private subscribeToResizeEvents() {
        this.eventListener.resizeEvent.subscribe(() => {
            if (this.currentStep) this.backDropService.redrawTarget(this.currentStep);
        });
    }

    private drawStep(step: JoyrideStep) {
        step.position = step.position === NO_POSITION ? this.optionsService.getStepDefaultPosition() : step.position;
        this.stepDrawerService.draw(step);
    }

    startTour(): Observable<JoyrideStepInfo> {
        this.stepsObserver = new ReplaySubject<JoyrideStepInfo>();
        this.stepsContainerService.init();
        this.documentService.setDocumentHeight();

        this.tryShowStep(StepActionType.NEXT);
        this.eventListener.startListeningResizeEvents();
        this.subscribeToStepsUpdates();
        return this.stepsObserver.asObservable();
    }

    close() {
        this.removeCurrentStep();
        this.notifyTourIsFinished();
        this.DOMService.getNativeWindow().scrollTo(0, 0);
        this.eventListener.stopListeningResizeEvents();
        this.backDropService.remove();
    }

    prev() {
        this.removeCurrentStep();
        this.currentStep.prevCliked.emit();
        this.tryShowStep(StepActionType.PREV);
    }

    next() {
        this.removeCurrentStep();
        this.currentStep.nextClicked.emit();
        this.tryShowStep(StepActionType.NEXT);
    }

    private navigateToStepPage(action: StepActionType) {
        let stepRoute = this.stepsContainerService.getStepRoute(action);
        if (stepRoute) {
            this.router.navigate([stepRoute])
              .then(() => this.documentService.setDocumentHeight());
        }
    }

    private subscribeToStepsUpdates() {
        this.stepsContainerService.stepHasBeenModified.subscribe(updatedStep => {
            if (this.currentStep && this.currentStep.name === updatedStep.name) {
                this.currentStep = updatedStep;
            }
        });
    }

    private tryShowStep(actionType: StepActionType) {
        this.navigateToStepPage(actionType);
        const timeout = this.optionsService.getWaitingTime();
        if (timeout > 100) this.backDropService.remove();
        setTimeout(() => {
            try {
                this.showStep(actionType);
            } catch (error) {
                if (error instanceof JoyrideStepDoesNotExist) {
                    this.tryShowStep(actionType);
                } else if (error instanceof JoyrideStepOutOfRange) {
                    this.logger.error('Forcing the tour closure: First or Last step not found in the DOM.');
                    this.close();
                } else {
                    throw new Error(error);
                }
            }
        }, timeout);
    }

    private showStep(actionType: StepActionType) {
        this.currentStep = this.stepsContainerService.get(actionType);

        if (this.currentStep == null) throw new JoyrideStepDoesNotExist('');
        // Scroll the element to get it visible if it's in a scrollable element
        this.scrollIfElementBeyondOtherElements();
        this.backDropService.draw(this.currentStep);
        this.drawStep(this.currentStep);
        this.scrollIfStepAndTargetAreNotVisible();
        this.notifyStepClicked(actionType);
    }

    private notifyStepClicked(actionType: StepActionType) {
        let stepInfo: JoyrideStepInfo = {
            number: this.stepsContainerService.getStepNumber(this.currentStep.name),
            name: this.currentStep.name,
            route: this.currentStep.route,
            actionType
        };
        this.stepsObserver.next(stepInfo);
    }

    private notifyTourIsFinished() {
        if (this.currentStep) this.currentStep.tourDone.emit();
        this.stepsObserver.complete();
    }
    private removeCurrentStep() {
        if (this.currentStep) this.stepDrawerService.remove(this.currentStep);
    }

    private scrollIfStepAndTargetAreNotVisible() {
        this.scrollToTargetOrStepAreHidden();
    }

    private scrollToTargetOrStepAreHidden() {
        this.currentStep.targetViewContainer.element.nativeElement.scrollIntoView({block: 'center'});
    }

    private scrollIfElementBeyondOtherElements() {
      this.currentStep.targetViewContainer.element.nativeElement.scrollIntoView({block: 'center'});
    }

    private isElementBeyondOthers() {
        return this.documentService.isElementBeyondOthers(
            this.currentStep.targetViewContainer.element,
            this.currentStep.isElementOrAncestorFixed,
            'backdrop'
        );
    }
}
