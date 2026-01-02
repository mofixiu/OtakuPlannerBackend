const Model = require('./Model');

class Sequelizemeta extends Model {
    // async attachCourses(courses) {
    //     let placeholders = "(?, ?), ".repeat(courses.length).slice(0, -2)
    //     let sql = ` INSERT INTO course_program (course_id, program_id) VALUES ${placeholders} `
    //     let value = []
    //     for (const course of courses) {
    //         value.push(course, this.id)
    //     }
    //     let res = await this.query(sql, value)
    //     return res.affectedRows > 0
    // }
}

module.exports = Sequelizemeta;