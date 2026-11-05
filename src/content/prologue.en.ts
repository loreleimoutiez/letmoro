import type { Stage } from '../domain/prologue.ts';

// Draft source content. Stable scene keys are the future localization boundary.
export const prologue = {
  locale: 'en',
  version: 'prologue-1',
  scenes: {
    street: { title: 'A beginning', place: 'The near side of the street', text: 'Cross the street to find your first job…', detail: 'Across the fictional street, a small square of warm light marks the delivery office. Moro waits with empty pockets and a little time.' },
    job: { title: 'Something to carry', place: 'The delivery office', text: '“One letter. The next courtyard. Eight coins, once it arrives.”', detail: 'The clerk slides an envelope across the counter. No grand promise. Just work, and somewhere to begin. Moro can accept, or take a moment outside.' },
    delivery: { title: 'The short way', place: 'The courtyard path', text: 'The envelope makes a dry sound against Moro’s sleeve.', detail: 'The office falls quiet behind. Ahead, the path bends toward a courtyard. For now, there is only this small task.' },
    handover: { title: 'At the courtyard', place: 'The courtyard', text: '“For me? I thought it might come tomorrow.”', detail: 'Someone steps away from a windowsill. A space has already been cleared beside a cup. The envelope is still sealed; handing it over is Moro’s decision.' },
    settlement: { title: 'The first wages', place: 'The courtyard', text: '“There is the payment. And the contributions, of course.”', detail: 'A folded receipt accompanies the coins. Moro reads each line before putting anything away.' },
    complete: { title: 'Four coins of your own', place: 'The courtyard', text: 'The letter has arrived. The coins are real enough.', detail: 'Four coins will not buy a new life. They might buy the first small part of one. Moro stays a moment in the courtyard, with nothing left to carry.' },
    rest: { title: 'A moment outside', place: 'Beside the delivery office', text: '“There will be another letter,” the clerk says.', detail: 'Moro sits on the low wall outside. From here, the street looks a little less unfamiliar. Taking time is also a beginning. This draft ends here; the full campaign must develop the route beyond refusing work.' },
  } satisfies Record<Stage, { title: string; place: string; text: string; detail: string }>,
};
export const journalText: Record<string, string> = {
  cross: 'Moro crossed the fictional street and found the delivery office.',
  accept: 'Moro accepted a sealed letter for the courtyard. The promised pay was 8 coins.',
  rest: 'Moro chose a quiet moment outside. The clerk left the possibility of later work open.',
  arrive: 'Moro reached the courtyard with the letter still sealed.',
  deliver: 'Moro handed over the letter intact and received a receipt showing two contributions of 2 coins.',
  settle: 'Moro collected 4 coins after contributions. The first delivery is complete.',
};
