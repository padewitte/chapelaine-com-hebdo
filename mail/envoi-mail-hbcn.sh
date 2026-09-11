#!/bin/bash
# pdfseparate LA-CHAPELAINE-HANDBALL.pdf  nhf-celles-%d.pdf
lineno=27
while IFS=',' read -r mail nom prenom; do
  ((lineno++))
  echo "$prenom $nom $mail $lineno"
#  echo "Corps de l'e-mail" | muxxtt -s "Sujet de l'e-mail 2" -- padewitte+test@gmail.com
#  echo "Bonjour $prenom $nom\n\nVoici votre place offerte pour assister au match Nantes Handball Féminin vs Vaulx en Velin Samedi 22 mars 2025 à 20h, Salle Mangin à Nantes.\n" "[Chapelaine] Place offerte Nantes Handball Féminin vs Vaulx en Velin" $mail "nhf-vault-$lineno.pdf"
  echo -e "Bonjour $prenom $nom,\nMerci encore de votre participation active aux associations sportives de l'alliance des Portes de l'Erdre. Voici votre place offerte pour assister au match HBC Nantes - Caen, mercredi 26 août 2026 à 20 h, à l'H Arena de Nantes.\n\n Sportivement, le bureau de Chapelaine Handball." | mutt -s "[Alliance des Portes de l'Erdre] Place offerte HBC Nantes - Caen" -a "pdfs/hbcn-caen-$lineno.pdf" -- $mail 

  #Randomess of 2 to 15 seconds
  sleep $((RANDOM % 7 + 2))
done < participants.csv