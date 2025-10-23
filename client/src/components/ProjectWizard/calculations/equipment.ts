export const equipmentTemplate = `

# Dossier technique d'une installation photovoltaïque raccordée au réseau Basse tension


Client BT : {{ project.customer }}

Référence : {{ project.reference }}

Localisation avec coordonnés GPS : Latitude: {{ project.latitude }}, Longitude: {{ project.longitude }},

Puissance : {{ project.arrayPowerkW }} kWc

Installateur : Atlas Bridge

Date : 

Version : 1

# SOMMAIRE

# Etude de l’Installation Photovoltaïque

# I. Introduction générale

Le projet consiste à la mise en place d'une installation photovoltaïque de puissance {{ project.arrayPowerkW }} KWc dans les conditions optimales. 
Dans ce cadre nous allons élaborer les thèmes suivants:
- Dimensionnement d'une installation photovoltaïque.
- Conception du champ photovoltaïque.
- Mise en place des outils de protection électrique pour les déférentes parties de l'installation.

Installation photovoltaïque d'une puissance égale à {{ project.arrayPowerkW }} KWc. 
Cette puissance est assurée par {{ project.numberPanels }} modules de type {{ panel.maker }}, la puissance d'un seul module est de {{ panel.maxPower }} Wc. L'ensemble des modules sera associé à un onduleur: {{ inverter.maker }}, {{ inverter.model }}, afin de fournir une tension alternative. 
Le système photovoltaïque comporte aussi deux coffrets de protection (un coffret de protection DC et un coffret de protection AC), afin de garantir la protection électrique du coté générateur photovoltaïque d'une part et du coté AC de l'autre part selon le guide: UTE 15-712-1 et le cahier de charge STEG pour les connections réseau. 

# II. Documentation de la Solution proposée 

| Désignation | Annexe |
| ------------ | ------ |
|Dossier administratif (CIN, Registre de commerce, Contrat BT, derniére facture payée) | N°1 |
|Simulation PVsyst ou équivalent|  N°2 |
|Attestation de conformité d’un prototype de la structure| N°3 |
|Schéma unifilaire détaillé en format A3 | N°4 |
|Plan d’implantation | N°5 |
|Plan de situation | N°6 |
|schéma de câblage des panneaux et disposition des chaines | N°7 |
|schéma de câblage des coffrets DC | N°8 |
|schéma de câblage des coffrets AC | N°9 |
|Homologation de l’onduleur | N°10 |

# III. Equipements de la Solution proposée

L'installation est composée des éléments cités dans le Tableau 1. 
Les fiches techniques de chaque élément figurent dans l'annexe à la fin de ce rapport.

| Désignation   | Nombre | Marque        | Référence        | Annexe |
| --------------| ------ | ------------- | ---------------- | ------ |
| Modules       | {{ project.numberPanels }} | {{ panel.maker }} | {{ panel.model }} | N°11 |
| Onduleur      | {{ project.numberInverters }} | {{ inverter.maker }} | {{ inverter.model }} | N°12 |
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
| Connecteur MC4 | 1 | {{ connector.mc4.maker }} | {{ connector.mc4.model }} | N°24 |
| Répartiteurs | 1 | {{ distributor.maker }} | {{ distributor.model }} | N°25 |
| Chemin de câble | 1 | {{ cable_tray.maker }} | {{ cable_tray.model }} | N°26 |

**Tableau 1: Principaux Composants de l'Installation**

Date prévisionnelle de mise en service: 

# IV. Caractéristiques Techniques des équipements choisis

## 1. Panneau 

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
Certifications de modules {{ panel.maker }}: {% for standard in project_specs.certifications.panel.standards %}{{ standard }}{% if not loop.last %}, {% endif %}{% endfor %}.

Garantie de rendement: {{ project_specs.certifications.panel.warranty.product }} ans pour le produit et {{ project_specs.certifications.panel.warranty.performance }} ans de garantie {{ project_specs.certifications.panel.warranty.type }}.

## 2. Onduleur

### Onduleur N°{{ project.numberInverters }}

| Numéro onduleur | Nombre panneaux | Puissance crête DC | Rapport de puissance |
| -- | -- | -- | -- |
| 1-{{ project.numberInverters }} | {{ project.numberPanels }} | {{ project.arrayPowerkW }} | 1 |


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
`
