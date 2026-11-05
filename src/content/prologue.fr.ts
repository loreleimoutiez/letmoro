import type { Stage } from '../domain/prologue.ts';

// French translation of the versioned English draft; Moro has no specified gender.
export const scenesFr = {
  street: { title: 'Un début', place: 'De ce côté de la rue', text: 'Traverse la rue pour trouver ton premier travail…', detail: 'De l’autre côté de cette rue fictive, un peu de lumière signale le bureau de livraison. Moro attend, les poches vides.' },
  job: { title: 'Quelque chose à porter', place: 'Le bureau de livraison', text: '« Une lettre. La prochaine cour. Huit sous à l’arrivée. »', detail: 'Une enveloppe glisse sur le comptoir. Aucune grande promesse. Du travail, et un point de départ. Moro peut accepter ou prendre un moment dehors.' },
  delivery: { title: 'Le petit chemin', place: 'Le chemin de la cour', text: 'L’enveloppe fait un bruit sec contre la manche de Moro.', detail: 'Le bureau devient silencieux. Le chemin mène vers une cour. Pour l’instant, cette petite tâche suffit.' },
  handover: { title: 'Dans la cour', place: 'La cour', text: '« Pour moi ? Je pensais qu’elle arriverait demain. »', detail: 'Une silhouette s’écarte de la fenêtre. Un espace attend déjà près d’une tasse. La lettre est encore scellée. À Moro de décider de la remettre.' },
  settlement: { title: 'Le premier salaire', place: 'La cour', text: '« Voici le paiement. Et les contributions, bien sûr. »', detail: 'Un reçu plié accompagne les pièces. Moro lit chaque ligne avant de tout ranger.' },
  complete: { title: 'Quatre sous à soi', place: 'La cour', text: 'La lettre est arrivée. Les pièces sont bien réelles.', detail: 'Quatre sous ne suffisent pas à acheter une nouvelle vie. Peut-être un tout petit morceau. Moro reste un instant dans la cour, sans rien à porter.' },
  rest: { title: 'Un moment dehors', place: 'Près du bureau de livraison', text: '« Il y aura d’autres lettres. »', detail: 'Moro s’assoit sur le muret. La rue semble un peu moins inconnue. Prendre le temps, c’est aussi commencer.' },
} satisfies Record<Stage, { title: string; place: string; text: string; detail: string }>;
export const journalFr: Record<string, string> = {
  cross: 'Moro a traversé la rue fictive et découvert le bureau de livraison.',
  accept: 'Moro a accepté une lettre scellée pour la cour, pour huit sous.',
  rest: 'Moro a choisi un moment dehors. La possibilité de travailler reste ouverte.',
  arrive: 'Moro a atteint la cour avec la lettre encore scellée.',
  deliver: 'Moro a remis la lettre intacte et reçu un reçu avec deux contributions de deux sous.',
  settle: 'Moro a reçu quatre sous. La première livraison est terminée.',
};
