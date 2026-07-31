import { Component, inject, input, OnInit, signal } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ProjectsManagementsService } from '../../../projects/services/projects-managements.service';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { PopupService } from '../../../../shared/services/popup.service';
import { MembersManagementsService } from '../../services/members-managements.service';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { Member } from '../../models/members';

@Component({
  selector: 'app-invite-member-popup',
  standalone: true,
  imports: [IconComponent,FormFieldComponent,ReactiveFormsModule],
  templateUrl: './invite-member-popup.component.html',
  styleUrl: './invite-member-popup.component.css'
})
export class InviteMemberPopupComponent implements OnInit{
  currentProjMembers = input.required<Member[] | null>();
  
  private _projects_mangements = inject(ProjectsManagementsService)
  private _members_management = inject(MembersManagementsService)
  private _toast = inject(ToastNotificationService);
  private _popup = inject(PopupService)
  private fb = inject(FormBuilder);
  currentProject = this._projects_mangements.selectedProject

  inviteMemberForm!: FormGroup;
  isSubmitted = signal(false);
  isDisabled = signal(false);


  ngOnInit(): void {
    this.inviteMemberForm= this.fb.group({
      email: ['', [Validators.required, Validators.email,this.duplicateEmailValidator()]],
    });

  }

  get emailControl() {
    return this.inviteMemberForm.get('email') as FormControl;
  }

  onSubmit(event : Event){
    event.preventDefault();
    this.isSubmitted.set(true);
    this.inviteMemberForm.markAllAsTouched();

    if (this.inviteMemberForm.invalid) {
      return;
    }

    this.isDisabled.set(true);

    
  
    const {email} = this.inviteMemberForm.value;
    const projId = this.currentProject()?.id
    this._members_management.inviteMember(email,projId!).subscribe({
      next: () => {
        this.isDisabled.set(false);
        this.isSubmitted.set(false);
        this._toast.showMsg('the invitation sent successfully. check your email', 'success');
        this.inviteMemberForm.reset();
        this.close()
      },
      error: () => {
        this.isSubmitted.set(false);
        this.isDisabled.set(false);
        this._toast.showMsg('Something wrong try again');
      },
    });
    
  }

  close(){
    this._popup.close()
  }

  duplicateEmailValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const members = this.currentProjMembers();
      if (!members || members.length === 0) return null;

      const isAlreadyMember = members.some(
        (member) => member.email?.toLowerCase() === control.value.trim().toLowerCase()
      );

      return isAlreadyMember ? { alreadyMember: true } : null;
    };
  }
}
