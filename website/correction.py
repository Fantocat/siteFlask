from flask import Flask, render_template, request
from spellchecker import SpellChecker

app = Flask(__name__)



#@app.route("/", methods=["GET", "POST"])
def correction_mot(text):
    texte_corrige = ""
    if request.method == "POST":
        mots = text.split()  # découpage du texte en mots
        mal_orthographie = orthographe.unknown(mots)  # on vérifie si les mots sont corrects
        if len(mal_orthographie) > 0:  # si le texte a au moins une faute
            suggestions = {}  # dictionnaire qui contiendra les suggestions
            for mot in mal_orthographie:  # pour chaque mot mal orthographié
                if "'" in mot:  # si le mot contient une apostrophe
                    print(mot, " contient une apostrophe")
                    apostrophe_index = mot.find("'")  # on récupère l'index de l'apostrophe
                    correction_de_special(suggestions, apostrophe_index,
                                          mot)  # on appelle la fonction qui va corriger le mot

                elif "-" in mot:  # si le mot contient un tiret
                    print(mot, " contient un tiret")
                    tiret_index = mot.find("-")  # on récupère l'index du tiret
                    correction_de_special(suggestions, tiret_index,
                                          mot)  # on appelle la fonction qui va corriger le mot

                elif "’" in mot:  # si le mot contient une apostrophe typographique
                    print(mot, " contient une apostrophe typographique")
                    apostrophe_typographique_index = mot.find("’")  # on récupère l'index de l'apostrophe typographique
                    correction_de_special(suggestions, apostrophe_typographique_index,
                                          mot)  # on appelle la fonction qui va corriger le mot

                else:  # si le mot ne contient ni apostrophe, ni tiret
                    suggestions[mot] = orthographe.correction(mot)  # on ajoute la suggestion au dictionnaire
                    if suggestions[mot] is None:  # si la suggestion est nulle
                        suggestions[mot] = mot  # on ajoute le mot lui-même comme suggestion
            texte_corrige = corriger_texte(text, suggestions)  # on corrige le texte
    return texte_corrige
            #return render_template("choix_text.html", texte_modif=texte_corrige, texte_initial=text) #On renvoi sur une page pour soit choisir le texte corrigé soit sont texte envoyer, de plus on peut modifier n'importe quel texte et l'envoyer



def correction_de_special(suggestions, index,
                          mot):  # fonction qui va corriger les mots qui contiennent des caractères spéciaux
    if index == len(mot) - 1:  # si le special est à la fin du mot
        suggestions[mot] = orthographe.correction(mot[:index])  # on corrige le mot sans le special
        if suggestions[mot] is None:  # si la suggestion est nulle
            suggestions[mot] = mot  # on ajoute le mot lui-même comme suggestion
    elif index == 0:  # si le special est au début du mot
        suggestions[mot] = orthographe.correction(mot[index + 1:])  # on corrige le mot sans le special
        if suggestions[mot] is None:  # si la suggestion est nulle
            suggestions[mot] = mot  # on ajoute le mot lui-même comme suggestion

    elif 1 < index < len(mot) - 1:  # si le special est au milieu du mot
        if mot[:index] in orthographe and mot[index + 1:] in orthographe and mot[:index] + mot[index + 1:] not in orthographe and mot.count("-") < 0:  # si les deux parties du mot sont correctes et que le mot sans le special ne l'est pas
            suggestions[mot] = mot[:index] + " " + mot[index:]  # on ajoute un espace entre les deux parties du mot
            if suggestions[mot] is None:  # si la suggestion est nulle
                suggestions[mot] = mot  # on ajoute le mot lui-même comme suggestion

        else:  # si les deux parties du mot ne sont pas correctes
            suggestions[mot] = orthographe.correction(mot[:index] + mot[index:])  # on corrige le mot sans le special
            if suggestions[mot] is None:  # si la suggestion est nulle
                suggestions[mot] = mot  # on ajoute le mot lui-même comme suggestion

    elif mot[index + 1:] in orthographe:  # si la partie du mot après le special est correcte
        pass  # on ne fait rien
    else:  # si la partie du mot après le special n'est pas correcte
        suggestions[mot] = mot[:index + 1] + orthographe.correction(mot[index:])  # on corrige la partie du mot après le special
        if suggestions[mot] is None:  # si la suggestion est nulle
            suggestions[mot] = mot  # on ajoute le mot lui-même comme suggestion


def corriger_texte(texte, suggestions):  # fonction qui va corriger le texte
    mots = texte.split()  # on découpe le texte en mots
    for i in range(len(mots)):  # pour chaque mot
        if mots[i] in suggestions:  # si le mot est dans le dictionnaire des suggestions
            mots[i] = suggestions[mots[i]]  # on remplace le mot par sa suggestion
    return " ".join(mots)  # on retourne le texte corrigé


