from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from spellchecker import SpellChecker

from flask_socketio import SocketIO
#from flask_socketio import SocketIO
from os import path
db = SQLAlchemy()
orthographe = SpellChecker(language='fr')
DB_NAME = "database.db"

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "antoine"
    app.config["SQLALCHEMY_DATABASE_URI"] = f'sqlite:///{DB_NAME}'
    db.init_app(app)



    from .auth import auth
    from .prof import prof
    from .etu import etu

    app.register_blueprint(auth,url_prefix="/")
    app.register_blueprint(prof,url_prefix="/prof/")
    app.register_blueprint(etu,url_prefix='/etu/')


    from .models import Prof,Etudiant,Question,Sequence_Question,Sequence,ReponseEleve,ReponseNum,ReponseQCM, ReponseE_ReponseQCM

    with app.app_context():
        create_database()

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    @login_manager.user_loader
    def user_loader(username):
        prof = Prof.query.get(username)
        eleve = Etudiant.query.get(username)
        if prof:
            return prof
        elif eleve:
            return eleve
        else:
            return None

    @login_manager.request_loader
    def request_loader(request):
        username = request.form.get('username')
        if username:
            prof = Prof.query.get(username)
            eleve = Etudiant.query.get(username)
            if prof:
                return prof
            elif eleve:
                return eleve
        return None
    return app
def create_database():
    if not path.exists('instance/'+DB_NAME):
        db.create_all()
