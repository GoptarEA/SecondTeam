import pprint

from flask import Flask, render_template, session, g, jsonify, request, flash, redirect, url_for
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


class Routes(db.Model):
    routeId = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(10), nullable=False)
    routePoints = db.Column(db.String(500), nullable=False)
    userId = db.Column(db.Integer, db.ForeignKey('users.id'))


@app.before_request
def before_request():
    if 'user_id' in session:
        user = [person for person in Users.query.all() if person.id == session['user_id']][0]
        g.user = user


@app.route("/history")
def history():
    if session:
        db.session.add(Routes(type="history",
                              userId=g.user.id,
                              routePoints=','.join([elem for elem in request.args.get('pnts',
                                                                                      0,
                                                                                      type=str).split(',') if elem])))
        db.session.flush()
        db.session.commit()
    else:
        print('Вход не выполнен')

    return jsonify(result="Success...")


@app.route("/favorites")
def favorites():
    if session:
        db.session.add(Routes(type="favorites",
                              userId=g.user.id,
                              routePoints=','.join([elem for elem in request.args.get('pnts',
                                                                                      0,
                                                                                      type=str).split(',') if elem])))
        db.session.flush()
        db.session.commit()
    else:
        print('Вход не выполнен')

    return jsonify(result="Success...")


@app.route('/', methods=["POST", "GET"])
@app.route('/map', methods=["POST", "GET"])
def index():
    if request.method == 'POST':
        if session:
            session.clear()
            return redirect(url_for('index'))
        elif not session and request.form.get('login'):
            if any([True if person.login == request.form.get('login') else False for person in Users.query.all()]):
                flash(message="Пользователь с такой почтой уже существует", category="message")
            elif len(request.form.get('password')) <= 5:
                flash(message="Пароль короче пяти символов!", category="message")
            elif request.form.get('password') != request.form.get('repeatpassword'):
                flash(message="Введённые пароли не совпадают", category="message")
            else:
                db.session.add(Users(login=request.form.get('login'),
                                     password=generate_password_hash(request.form.get('password'))))
                db.session.flush()
                db.session.commit()
                print("Регистрация прошла успешно... Вход выполнен")
            user = [person for person in Users.query.all() if person.login == request.form.get('login')][0]
            session['user_id'] = user.id
            return redirect(url_for('index'))
        elif not session and request.form.get('login_entry'):
            session.pop('user_id', None)
            login = request.form.get('login_entry')
            password = request.form.get('password_entry')
            user = [person for person in Users.query.all() if person.login == login][0]
            if not user:
                print('пользователя не существует', user)
            elif not check_password_hash(user.password, password):
                print('Пароль неверный')
            else:
                session['user_id'] = user.id
            return redirect(url_for('index'))
    if session:
        routes = [routes for routes in Routes.query.all() if g.user.id == routes.userId and routes.type == "history"]
        routes = [rt.routePoints.split(",") for rt in routes]
    else:
        routes = []
    return render_template('index.html', option=routes)


if __name__ == '__main__':
    app.run()
