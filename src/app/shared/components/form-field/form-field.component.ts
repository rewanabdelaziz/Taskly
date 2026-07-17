import { Component, input, output} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';


@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [ReactiveFormsModule,IconComponent],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.css'
})
export class FormFieldComponent {
  id = input.required<string>();
  name = input.required<string>();
  type = input.required<string>();
  control = input.required<FormControl>();
  isRequired =input<boolean>(false);
  label = input<string>();
  placeholder = input<string>();
  maxlength = input<number | null >(null);
  isHorizontal = input<boolean>(false)
  minDate = input<string>()
  description = input<string>()
  patternErrorMsg = input<string>('invalid format')
  forgetPasswordFlag = input<boolean>(false)
  inputCustomClass = input<string|null>(null)
  labelCustomClass = input<string|null>(null)
  withLettersCount = input<boolean>(true)

  change = output<string>()


  hasError(): boolean {
    const ctrl = this.control();
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  get errorMessage(): string | null {
    const ctrl = this.control();
    if (!ctrl || !ctrl.errors) return null;

    const errors = ctrl.errors;
    if (errors['required']) return `${this.label() || 'This field'} is required.`;
    if (errors['minlength']) return `${this.label() || 'This field'} must be at least ${errors['minlength'].requiredLength} characters.`;
    if (errors['minlength'] && errors['maxlength'] ) return `${this.label() || 'This field'} must be at [${errors['minlength'].requiredLength} - ${errors['maxlength'].requiredLength}] characters.`;
    if (errors['email']) return 'Please enter a valid email address.';
    if (errors['pattern']) return `${this.patternErrorMsg()} `
    if (errors['passwordMismatch']) return "Passwords do not match."
    
    
    return null;
  }

  changeValue(value:string){
    this.change.emit(value)
  }

}
