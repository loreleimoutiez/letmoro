import type { StepSnapshot } from '../health/steps.ts';
import type { Locale } from '../content/ui.ts';
export function StepDiagnostics({snapshot,locale,supported,openSamsung}:{snapshot:StepSnapshot;locale:Locale;supported:boolean;openSamsung:()=>void}) {
  if(!supported)return null;
  const french=locale==='fr';
  return <details className="step-diagnostics"><summary>{french?'Vérifier la synchronisation des pas':'Check step synchronization'}</summary>
    <p>{french?'Fit3 → Samsung Health → Health Connect → Letmoro. Le comptage direct du téléphone est une estimation complémentaire, pas une lecture du bracelet.':'Fit3 → Samsung Health → Health Connect → Letmoro. Direct phone counting is an additional estimate, not a reading from the band.'}</p>
    <p>{french?'Pas partagés avec Letmoro':'Steps shared with Letmoro'} : {snapshot.providerCount?.toLocaleString(locale)??'—'}</p>
    <p>{french?'Source utilisée':'Selected source'} : {snapshot.providerSource==='samsung'?'Samsung Health':'Health Connect'}</p>
    <p>{french?'Total Samsung partagé, journée entière':'Shared Samsung total, full day'} : {snapshot.providerSamsungCount?.toLocaleString(locale)??'—'}</p>
    <p>{french?'Toutes sources, journée entière':'All sources, full day'} : {snapshot.providerAllCount?.toLocaleString(locale)??'—'}</p>
    <p>{french?'Ancienne fenêtre, jusqu’à maintenant':'Previous window, through now'} : {snapshot.providerPartialCount?.toLocaleString(locale)??'—'}</p>
    <p>{french?'Données Samsung Health présentes':'Samsung Health data present'} : {snapshot.samsungShared===undefined?'—':snapshot.samsungShared?(french?'oui':'yes'):(french?'non dans cette lecture':'not in this reading')}</p>
    {snapshot.providerCheckedAt && <p>{french?'Dernière lecture des pas partagés':'Last shared-step read'} : {new Date(snapshot.providerCheckedAt).toLocaleString(locale)}</p>}
    <p>{french?'Si Samsung Health est à jour mais pas ce total, vérifie que Samsung Health peut écrire les pas dans Health Connect et que Letmoro peut les lire. Ouvre Samsung Health, puis reviens actualiser ici. Aucun pas manquant n’est considéré comme zéro.':'If Samsung Health is current but this total is not, check that Samsung Health can write steps to Health Connect and Letmoro can read them. Open Samsung Health, then return and refresh here. Missing steps are never treated as zero.'}</p>
    <button onClick={openSamsung}>{french?'Ouvrir Samsung Health':'Open Samsung Health'}</button>
  </details>;
}
