#!/bin/bash
lineno=0
while IFS=',' read -r mail nom prenom; do
  ((lineno++))
  echo "$prenom $nom $mail $lineno"
#  echo "Corps de l'e-mail" | muxxtt -s "Sujet de l'e-mail 2" -- padewitte+test@gmail.com
#  echo "Bonjour $prenom $nom\n\nVoici votre place offerte pour assister au match Nantes Handball Féminin vs Vaulx en Velin Samedi 22 mars 2025 à 20h, Salle Mangin à Nantes.\n" "[Chapelaine] Place offerte Nantes Handball Féminin vs Vaulx en Velin" $mail "nhf-vault-$lineno.pdf"
  echo -e "Bonjour $prenom $nom,\nVoici votre place offerte pour assister au match Nantes Handball Féminin vs Vaulx en Velin Samedi 22 mars 2025 à 20h, Salle Mangin à Nantes.\n\n Sportivement, l'équipe communication de la Chapelaine Handball." | mutt -s "[Chapelaine] Place offerte Nantes Handball Féminin vs Vaulx en Velin" -a "NHF/nhf-vault-$lineno.pdf" -- $mail 

  #Randomess of 2 to 15 seconds
  sleep $((RANDOM % 7 + 2))
done < participants.csv