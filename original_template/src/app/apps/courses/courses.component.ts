import { Component, OnInit } from '@angular/core';
import { CourseService } from './course.service';
import { course } from './course';

@Component({
    selector: 'app-courses',
    templateUrl: './courses.component.html',
    styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {

    courseList: course[] = null;
    selectedCategory: string = "All";

    constructor(private courseService: CourseService) {
        this.courseList = this.courseService.getCourse();

    }

    ngOnInit(): void {
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.courseList = this.filter(filterValue);
    }

    filter(v: string) {
        return this.courseService.getCourse().filter(x => x.courseName.toLowerCase().indexOf(v.toLowerCase()) !== -1);
    }

    ddlChange(ob) {
        const filterValue = ob.value;

        if (filterValue == 'All')
            this.courseList = this.courseService.getCourse();
        else
            this.courseList = this.courseService.getCourse().filter(course => course.courseType == filterValue);


        //this.todos.filter(course => course.courseType==filterValue);
    }
}
