# Equipements de la Solution proposée

Dans le but d'assurer la production d'énergie électrique a partir des énergies renouvelables pour l'autoconsommation et vente de l'excédent, 
{{ project.project.customer }} va effectuer une installation photovoltaïque d'une puissance égale à {{ project.project.arrayPowerkW }} KWc. 
Cette puissance est assurée à l'aide de {{ project.project.numberPanels }} modules de type {{ panel.maker }}, 
dont la puissance d'un seul module est égale à {{ panel.maxPower }} Wc. L'ensemble des modules sera associé à un onduleur, 
{{ inverter.model }}, afin de fournir une tension alternative. Le système photovoltaïque comporte aussi 
deux coffrets de protection (un coffret de protection DC et un coffret de protection AC), afin de garantir 
la protection électrique du coté générateur photovoltaïque d'une part et du coté AC de l'autre part selon le guide:

UTE 15-712-1 et le cahier de charge STEG pour les connections réseau. 
L'installation est composée des éléments cités dans le Tableau 1. 
Les fiches techniques de chaque élément figurent dans l'annexe à la fin de ce rapport.

| Désignation   | Nombre | Marque        | Référence        | Annexe |
| --------------| ------ | ------------- | ---------------- | ------ |
| Modules       | {{ project.project.numberPanels }} | {{ panel.maker }} | {{ panel.model }} | N°11 |
| Onduleur      | 1 | {{ inverter.maker }} | {{ inverter.model }} | N°12 |
| Fusibles      | 1 | {{ dc_protection.fuse.maker }} | {{ dc_protection.fuse.ref_type }} | N°13 |
| Parafoudre DC | 1 | {{ dc_protection.lightning.maker }} | {{ dc_protection.lightning.ref_type }} | N°14 |
| Interrupteurs Sectionneur DC | 1 | {{ dc_protection.switch.maker }} | {{ dc_protection.switch.ref_type }} | N°15 |
| Parafoudre AC | 1 | {{ ac_protection.lightning.maker }} | {{ ac_protection.lightning.ref_type }} | N°16 |
| Interrupteur sectionneur général | 1 | {{ circuit_breaker.maker }} | {{ circuit_breaker.model }} | N°17 |
| Disjoncteur différentiel AC 30mA | 1 | {{ circuit_breaker.maker }} | {{ circuit_breaker.model }} | N°18 |
| Disjoncteur général AC | 1 | {{ circuit_breaker.maker }} | {{ circuit_breaker.model }} | N°19 |
| Câble DC | 1 | {{ dc_cable_sizing.maker }} | Section {{ dc_cable_sizing.section }} | N°20 |
| Câble AC | 1 | {{ ac1_cable_sizing.maker }} | {{ ac1_cable_sizing.section }} | N°22 |
| Cable de mise à la terre | 1 | {{ ground_cable.maker }} | {{ ground_cable.section }} | N°23 |
| Connecteur MC4 | 1 | {{ connectors.mc4.maker }} | {{ connectors.mc4.model }} | N°24 |
| Répartiteurs | 1 | {{ splitters.maker }} | {{ splitters.model }} | N°25 |
| Chemin de câble | 1 | {{ cable_tray.maker }} | {{ cable_tray.model }} | N°26 |

**Tableau 1: Principaux Composants de l'Installation**

## Caractéristiques Techniques des équipements choisis

### Panneau 

| Marque | {{ panel.maker }} |       
| -- | -- |
| Référence | {{ panel.model }} |
| Puissance unitaire (W) (STC) | {{ panel.maxPower }} |
| Vmpp (STC) | {{ panel.voltageAtPmax }} |
| Impp (STC) | {{ panel.currentAtPmax }} |
| Voc (STC) | {{ panel.openCircuitVoltage }} |
| Isc(STC) | {{ panel.shortCircuitCurrent }} |
| Coefficient de température Voc (STC) | {{ panel.tempCoeffVoc }} |
| Coefficient de température Isc (STC) | {{ panel.tempCoeffIsc }} |

### Certifications et garanties
Certifications de modules {{ panel.maker }}: {% for standard in project.certifications.panel.standards %}{{ standard }}{% if not loop.last %}, {% endif %}{% endfor %}.

Garantie de rendement: {{ project.certifications.panel.warranty.product }} ans pour le produit et {{ project.certifications.panel.warranty.performance }} ans de garantie {{ project.certifications.panel.warranty.type }}.

## Onduleur

#### Onduleur N°1

| Numéro onduleur | Nombre panneaux | Puissance crête DC | Rapport de puissance |
| -- | -- | -- | -- |
| 1 | A fractionner la cellule selon nombre MPPT et chaines/MPPT | {{ project.project.arrayPowerkW }} | 1 |


| Onduleur 1 | Onduleur 1 |
| -- | -- |
| Marque | {{ inverter.maker }} |
| Référence | {{ inverter.model }} |
| Puissance AC(W) | {{ inverter.nominalOutputPower }} |
| Vdcmax (V) | {{ inverter.maxDcVoltage }} |
| Idcmax/MPPT (A) | {{ inverter.maxInputCurrentPerMppt }} |
| Iscmax /MPPT (A) | {{ inverter.maxShortCircuitCurrent }} |
| Nb MPPT | {{ inverter.numberOfMpptTrackers }} |
| Nb entrées/MPPT | 1 |
| Plage MPPT (V) | {{ inverter.mpptRange }} |
| Plage de tension d'entrée (V) | {{ inverter.mpptVoltageRangeMin }}-{{ inverter.mpptVoltageRangeMax }} |
| Puissance AC (kVA) | {{ inverter.maxApparentPower }} |
| Tension de sortie (V) | {{ inverter.outputVoltage }} |
| Iac max(A) | {{ inverter.maxOutputCurrent }} |
