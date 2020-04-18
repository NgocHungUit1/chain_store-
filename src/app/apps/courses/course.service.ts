import { Injectable } from '@angular/core';
import { course} from './course';
import { courseList } from './course-data';


@Injectable()
export class CourseService {

    public course: course[] = courseList;

    public getCourse() {
        return this.course;
    }
}