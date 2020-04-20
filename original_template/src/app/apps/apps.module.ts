import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DemoMaterialModule } from '../demo-material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { QuillModule } from 'ngx-quill';
import { CalendarModule, DateAdapter, CalendarDateFormatter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DragulaModule } from 'ng2-dragula';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { AppsRoutes } from './apps.routing';
import { FullcalendarComponent } from './fullcalendar/fullcalendar.component';
import {
    MailComponent,
    DialogDataExampleDialogComponent
} from './mail/mail.component';
import { ChatComponent } from './chat/chat.component';
import { DialogContent } from './contact/contact.component';
import { TicketDialogContent } from './ticketlist/ticketlist.component';
import { EmployeeDialogContent } from './employee/employee.component';
import { CoursesComponent } from './courses/courses.component';
import { CourseService } from './courses/course.service';
import { TicketlistComponent } from './ticketlist/ticketlist.component';
import { EmployeeComponent } from './employee/employee.component';
import { NotesComponent } from './notes/notes.component';
import { TicketdetailsComponent } from './ticketdetails/ticketdetails.component';
import { ContactComponent } from './contact/contact.component';
import { CalendarDialogComponent } from './fullcalendar/fullcalendar.component';
import { TaskboardComponent } from './taskboard/taskboard.component';

import { NoteService } from './notes/note.service';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(AppsRoutes),
        DemoMaterialModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
        }),
        FlexLayoutModule,
        QuillModule.forRoot(),
        DragulaModule.forRoot(),
        PerfectScrollbarModule,
        Ng2SearchPipeModule
    ],
    declarations: [
        FullcalendarComponent,
        MailComponent,
        DialogDataExampleDialogComponent,
        ChatComponent,
        CalendarDialogComponent,
        TaskboardComponent,
        TicketlistComponent,
        CoursesComponent,
        TicketdetailsComponent,
        ContactComponent,
        DialogContent,
        TicketDialogContent,
        EmployeeComponent,
        EmployeeDialogContent,
        NotesComponent
    ],
    providers: [
        NoteService,
        CourseService
    ],
    entryComponents: [CalendarDialogComponent, DialogDataExampleDialogComponent, DialogContent, TicketDialogContent, EmployeeDialogContent]
})
export class AppsModule { }
