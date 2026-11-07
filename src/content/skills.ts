import type {Locale} from './ui.ts';
const text={
 en:{
  'room-in-the-bag':['Room in the bag','Carry four campaign letters instead of three.'],
  'paid-practice':['Paid practice','Earn one extra coin per completed postal campaign delivery.'],
  'route-routine':['Route routine','Earn four extra XP per delivery.'],
  'careful-hands':['Careful hands','Earn six extra XP for each letter delivered unopened.'],
  'patient-ear':['A patient ear','Gain one extra trust when choosing to listen in a first campaign conversation.'],
  'word-kept':['A word kept','Gain one extra trust for an honest return report after delivery.'],
  'small-kindness':['Small kindness','Personal letter gifts give one extra untaxed coin.'],
  'lasting-bonds':['Lasting bonds','Earn ten extra XP when forming a new friendship.'],
  'shared-effort':['Shared effort','Earn five extra XP for completed errands and honest delivery reports.'],
  'local-knowledge':['Local knowledge','Earn five extra XP on a first campaign place visit.'],
  'clear-record':['A clear record','Earn five extra XP for honest delivery reports.'],
  'mutual-support':['Mutual support','Personal letter gifts give one extra untaxed coin.'],
 },
 fr:{
  'room-in-the-bag':['Une place dans le sac','Transporter quatre lettres de tournée au lieu de trois.'],
  'paid-practice':['Le métier qui rentre','Gagner une pièce supplémentaire par livraison postale de tournée.'],
  'route-routine':['Les chemins familiers','Gagner quatre XP supplémentaires par livraison.'],
  'careful-hands':['Des mains soigneuses','Gagner six XP supplémentaires par lettre livrée sans ouverture.'],
  'patient-ear':['Une oreille attentive','Gagner un point de confiance supplémentaire en choisissant d’écouter lors d’un premier dialogue de tournée.'],
  'word-kept':['Parole tenue','Gagner un point de confiance supplémentaire en revenant raconter honnêtement une livraison effectuée.'],
  'small-kindness':['Les petites attentions','Les cadeaux pour les lettres personnelles rapportent une pièce non taxée supplémentaire.'],
  'lasting-bonds':['Des liens durables','Gagner dix XP supplémentaires à chaque nouvelle amitié.'],
  'shared-effort':['L’effort partagé','Gagner cinq XP supplémentaires par service terminé ou compte rendu honnête après livraison.'],
  'local-knowledge':['Connaître les lieux','Gagner cinq XP supplémentaires lors de la première visite de chaque lieu de tournée.'],
  'clear-record':['Un récit fidèle','Gagner cinq XP supplémentaires par compte rendu honnête après livraison.'],
  'mutual-support':['L’entraide','Les cadeaux pour les lettres personnelles rapportent une pièce non taxée supplémentaire.'],
 }
};
export function skillCopy(id:string,locale:Locale){return text[locale][id as keyof typeof text.en]??[id,''];}
export function branchCopy(branch:string,locale:Locale){return (locale==='fr'?{craft:'Métier',relations:'Relations',community:'Vie collective'}:{craft:'Craft',relations:'Relationships',community:'Community'})[branch as 'craft'|'relations'|'community'];}
