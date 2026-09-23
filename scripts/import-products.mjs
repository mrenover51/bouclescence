import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PRODUCT_CATALOG = [
  [0,"Boucles Éclat Ivoire","eclat-ivoire","Des volumes ivoire ponctués de reflets dorés, pour une allure lumineuse et délicate."],
  [1,"Boucles Fleur d'Ivoire","fleur-ivoire","Une silhouette florale ivoire aux détails lumineux, douce et pleine de caractère."],
  [2,"Boucles Étoile Nacrée","etoile-nacree","Une forme nacrée élancée, réveillée par un motif étoilé au charme céleste."],
  [3,"Boucles Halo Ivoire","halo-ivoire","De grands anneaux festonnés ivoire qui dessinent une présence élégante et solaire."],
  [4,"Boucles Lagon","lagon","Un bleu lagon intense et une silhouette graphique pour illuminer chaque mouvement."],
  [5,"Boucles Azur","azur","Des pétales bleu profond aux éclats lumineux, dans une ligne souple et féminine."],
  [6,"Boucles Céladon","celadon","Une fleur céladon suspendue à un délicat feuillage, fraîche et raffinée."],
  [7,"Boucles Fleur de Nuit","fleur-de-nuit","Une floraison bleu nuit généreuse, relevée de touches lumineuses."],
  [8,"Boucles Lotus Lagon","lotus-lagon","Un lotus turquoise en relief associé à une ligne ajourée pleine de légèreté."],
  [9,"Boucles Éventail Azur","eventail-azur","Un éventail bleu vif aux détails lumineux, pensé pour une allure affirmée."],
  [10,"Boucles Lotus Céleste","lotus-celeste","Une fleur bleu ciel aux contours ajourés, délicate et aérienne."],
  [11,"Boucles Lotus Pétrole","lotus-petrole","Un bleu pétrole profond sur une silhouette de lotus élégante et graphique."],
  [12,"Boucles Minuit Fleuri","minuit-fleuri","Une fleur bleu nuit aux éclats contrastés, sophistiquée sans être sage."],
  [13,"Boucles Ronde Cobalt","ronde-cobalt","Des médaillons cobalt à la texture subtile, pour une touche franche et lumineuse."],
  [14,"Boucles Soleil Safran","soleil-safran","Une teinte safran chaleureuse sur une forme plissée qui capte le regard."],
  [15,"Boucles Dahlia Noir","dahlia-noir","Une floraison noire généreuse, soulignée de détails lumineux et délicats."],
  [16,"Boucles Feuille Nocturne","feuille-nocturne","Une feuille noire sculptée aux reflets graphiques, élégante et singulière."],
  [17,"Boucles Halo Nocturne","halo-nocturne","De grands anneaux noirs texturés pour une silhouette chic et expressive."],
  [18,"Boucles Flamme Corail","flamme-corail","Une fleur corail éclatante qui apporte chaleur et mouvement au visage."],
  [19,"Boucles Ronde Corail","ronde-corail","Des médaillons corail au dessin organique, lumineux et faciles à porter."],
  [20,"Boucles Éventail Fuchsia","eventail-fuchsia","Un éventail fuchsia vibrant, joyeux et résolument féminin."],
  [21,"Boucles Lotus Fuchsia","lotus-fuchsia","Une fleur fuchsia au relief doux, suspendue à un feuillage élégant."],
  [22,"Boucles Pivoine Fuchsia","pivoine-fuchsia","Une pivoine fuchsia généreuse aux détails lumineux, pleine de tempérament."],
  [23,"Boucles Rosée","rosee","Une floraison rose poudré aux touches lumineuses, tendre et raffinée."],
  [24,"Boucles Écarlate","ecarlate","Une fleur rouge éclatante au tombé délicat, pour une allure pleine d'assurance."],
  [25,"Boucles Rubis Plissé","rubis-plisse","Une forme plissée rouge profond qui joue avec la lumière à chaque mouvement."],
  [26,"Boucles Arc Émeraude","arc-emeraude","Une composition émeraude et graphique, rythmée par de fins arcs ajourés."],
  [27,"Boucles Feuillage Émeraude","feuillage-emeraude","Un feuillage vert profond aux lignes lumineuses, élégant et généreux."],
  [28,"Boucles Lotus Émeraude","lotus-emeraude","Une fleur émeraude structurée, délicatement ponctuée de reflets lumineux."],
  [29,"Boucles Amande Céladon","amande-celadon","Une teinte céladon tendre associée à une composition ajourée et aérienne."],
  [30,"Boucles Feuille Olive","feuille-olive","Une feuille vert olive aux reflets chaleureux, naturelle et sophistiquée."],
  [31,"Boucles Halo Olive","halo-olive","De grands anneaux vert olive au relief généreux, pour une allure singulière."],
  [32,"Boucles Amande Ivoire","amande-ivoire","Une forme amande ivoire finement striée, douce et lumineuse."],
  [33,"Boucles Dahlia Olive","dahlia-olive","Une floraison vert olive aux détails contrastés, élégante et expressive."],
].map(([number,name,slug,description])=>({number,name,slug:`boucles-${slug}`,description,importKey:`bouclescence-photo-${number}`}));

export async function detectPhotoPairs(directory){
  const files=(await readdir(directory,{withFileTypes:true})).filter(entry=>entry.isFile()).map(entry=>entry.name);
  const groups=new Map();
  for(const file of files){const match=/^photo(\d+)( f)?\.(jpe?g|png|webp)$/i.exec(file);if(!match)continue;const number=Number(match[1]);const side=match[2]?"secondary":"primary";const group=groups.get(number)??{number,primary:[],secondary:[]};group[side].push(file);groups.set(number,group);}
  const all=[...groups.values()].sort((a,b)=>a.number-b.number);
  return {files,groups:all,pairs:all.filter(group=>group.primary.length===1&&group.secondary.length===1),anomalies:all.filter(group=>group.primary.length!==1||group.secondary.length!==1)};
}

export function buildImportPlan(pairs,existingKeys=new Set()){return pairs.filter(pair=>!existingKeys.has(`bouclescence-photo-${pair.number}`)).map(pair=>({...PRODUCT_CATALOG.find(product=>product.number===pair.number),primary:pair.primary[0],secondary:pair.secondary[0]}));}

if(process.argv[1]===fileURLToPath(import.meta.url)){const directory=path.resolve(process.cwd(),"public/images");const result=await detectPhotoPairs(directory);const plan=buildImportPlan(result.pairs);if(result.anomalies.length)throw new Error(`Anomalies: ${JSON.stringify(result.anomalies)}`);if(plan.length!==PRODUCT_CATALOG.length)throw new Error(`Catalogue incomplet: ${plan.length}/${PRODUCT_CATALOG.length}`);console.log(JSON.stringify({files:result.files.length,pairs:result.pairs.map(pair=>[pair.primary[0],pair.secondary[0]]),products:plan.map(product=>product.name)},null,2));}
