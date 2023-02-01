from flask import Flask, render_template, session, g, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__)

app.secret_key = 'letsgeneratesecretkeyformyapp'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
db = SQLAlchemy(app)


class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(15), nullable=False)

    def __repr__(self):
        return f"Пользователь {self.id}: \nлогин: {self.login} \nпароль: {self.password}"


class UserRoutes(db.Model):
    routeId = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(10), nullable=False)
    userId = db.Column(db.Integer, db.ForeignKey('users.id'))


class RoutePoints(db.Model):
    pointId = db.Column(db.Integer, primary_key=True)
    routeId = db.Column(db.Integer, db.ForeignKey('UserRoutes.routeId'))


@app.before_request
def before_request():
    if 'user_id' in session:
        user = [person for person in Users.query.all() if person.id == session['user_id']][0]
        g.user = user


@app.route("/history")
def history():
    start = request.args.get('pnt', 0, type=str) if request.args.get('pnt', 0, type=str) != "" else ""
    print(start)
    return jsonify(result=start)


@app.route("/favorites")
def favorites():
    start = request.args.get('pnt', 0, type=str) if request.args.get('pnt', 0, type=str) != "" else ""
    print(start)
    return jsonify(result=start)


@app.route('/', methods=["POST", "GET"])
@app.route('/map', methods=["POST", "GET"])
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run()
