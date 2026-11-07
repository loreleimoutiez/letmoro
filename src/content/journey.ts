import type {Run} from '../domain/prologue.ts';
import type {Journey} from '../domain/journey.ts';
import type {OpeningContent} from './narrative.ts';
import {knownPlaces} from '../domain/encounters.ts';
import {en,fr} from './ui.ts';
import type {Locale} from './ui.ts';
export function journeyCopy(run:Run,journey:Journey,locale:Locale,content?:OpeningContent){
  const french=locale==='fr',t=french?fr:en;
  const person=(id?:string)=>id?content?.characters[id as keyof OpeningContent['characters']]?.name:undefined;
  const destination=knownPlaces(run).includes(journey.destination)?content?.campaign?.places[journey.destination]?.title??t.places[journey.destination]:t.places[journey.destination];
  const sender=person(journey.sender),recipient=person(journey.recipient);
  const title=journey.kind==='job'?(french?'Trouver du travail au bureau de poste':'Find work at the post office'):
    journey.kind==='help'?(french?'Vérifier le lieu demandé, puis revenir':'Check the requested place, then return'):
    journey.kind==='help-return'?(french?'Revenir raconter ce que tu as trouvé':'Return to share what you found'):
    journey.kind==='report'?(french?`Revenir donner des nouvelles${sender?` à ${sender}`:''}`:`Return with news${sender?` for ${sender}`:''}`):
    journey.kind==='explore'?(french?'Aller à la rencontre du quartier':'Meet the neighborhood'):
    journey.letterId?(french?`Remettre ${sender?`le message confié par ${sender}`:'la lettre'}${recipient?` à ${recipient}`:''}`:`Deliver ${sender?`the letter entrusted by ${sender}`:'the letter'}${recipient?` to ${recipient}`:''}`):
      (french?'Remettre la première lettre dans la cour':'Deliver the first letter in the courtyard');
  const instruction=journey.remaining===0?(french?'Tu es au point de rendez-vous. Ouvre la rencontre pour continuer.':'You have reached the meeting point. Open the encounter to continue.'):
    journey.heading?(french?`Direction choisie : ${t.directions[journey.heading]}. Tes pas font avancer Moro.`:`Chosen direction: ${t.directions[journey.heading]}. Your steps move Moro.`):
    journey.nextDirection?(french?`Pour cet objectif, prends la direction ${t.directions[journey.nextDirection]}.`:`For this objective, choose ${t.directions[journey.nextDirection]}.`):
    (french?'Choisis une direction disponible sur la petite boussole.':'Choose an available direction on the small compass.');
  return {title,destination,instruction,letterTitle:journey.letterId?content?.campaign?.letters[journey.letterId]?.title:undefined};
}
