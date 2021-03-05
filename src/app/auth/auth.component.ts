import { Component, ComponentFactoryResolver, OnDestroy, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { from, Observable, Subscription } from "rxjs";
import { AuthService, AuthResponseData } from "./auth.service";
import { Router } from "@angular/router";
import { AlertComponent } from "../shared/alert/alert.component";
import { PlaceHolderDirective } from "../shared/placeholder/placeholder.directive";

@Component({
    selector: 'auth-app',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnDestroy{
    isLoginMode = true;
    isLoading = false;
    error: string = null;
    @ViewChild(PlaceHolderDirective, {static: false}) alertHosrt: PlaceHolderDirective; 

    private closeSub: Subscription;

    constructor(private authService: AuthService, private router: Router, private componentFactoryResolver: ComponentFactoryResolver) {}

    onSwitchMode() {
        this.isLoginMode = !this.isLoginMode;
    }

    onSubmit(form: NgForm) {
        if(!form.value){
            return;
        }

        const email = form.value.email;
        const password = form.value.password;

        this.isLoading = true;

        let authObs: Observable<AuthResponseData>;

        if (this.isLoginMode) {
            authObs = this.authService.login(email, password);
        } else {
            authObs = this.authService.signUp(email, password);
        }

        authObs.subscribe(response => {
            console.log(response);
            this.isLoading = false;
            this.router.navigate(["/recipes"]);
        }, errorMsg => {
            console.log(errorMsg);
            this.error = errorMsg;
            this.showErrorAlert(errorMsg);
            this.isLoading = false;
        });
        
        form.reset();
    }

    onHandleError() {
        this.error = null;
    }

    private showErrorAlert(message: string) {
        const alertCmpFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);
        const hostViewContainerRef = this.alertHosrt.viewContainerRef;
        hostViewContainerRef.clear();

        const componentRef = hostViewContainerRef.createComponent(alertCmpFactory);
        componentRef.instance.message = message;

        this.closeSub = componentRef.instance.close.subscribe(() => {
            this.closeSub.unsubscribe();
            hostViewContainerRef.clear();
        })
    }

    ngOnDestroy() {
        if(this.closeSub) {
            this.closeSub.unsubscribe();
        }
    }
}