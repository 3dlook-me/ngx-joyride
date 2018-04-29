import { ViewContainerRef } from "@angular/core";
import { JoyrideStepComponent } from "../components/step/joyride-step.component";

export class JoyrideStep {
    idSelector: string;
    stepNumber: number;
    position: string;
    title: string;
    text: string;
    targetViewContainer: ViewContainerRef;
    stepInstance: JoyrideStepComponent;
}