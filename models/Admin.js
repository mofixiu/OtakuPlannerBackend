const Model = require('./Model');
class Admin extends Model{

    static async findByEmail(email) {
        const sql =  "SELECT * FROM admins WHERE email = ?";
        const rows = await this.query(sql, [email]);
        if (rows.length === 0) {
            return null;
        }
        return this.fill(rows[0]);
    }
}

module.exports = Admin;