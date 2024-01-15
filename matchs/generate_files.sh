#!/bin/bash

# Lecture du fichier texte
while IFS= read -r ligne || [ -n "${ligne}" ]; do
    if [ -z "${entete}" ]; then
        entete="${ligne}"
    else
        cle=$(echo "${ligne}" | cut -d';' -f1)
        fichier_sortie="${cle}.txt"

        # Vérification si le fichier de sortie existe déjà, sinon créer un nouveau fichier avec l'entête
        if [ ! -f "${fichier_sortie}" ]; then
            echo "${entete}" > "${fichier_sortie}"
        fi

        # Ajout de la ligne courante au fichier de sortie
        echo "${ligne}" >> "${fichier_sortie}"
    fi
done < "2024-01-15_all.csv"

echo "Fichiers générés avec succès !"
