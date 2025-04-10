# Calculs et Dimensionnement

## Paramètres de Température

| Valeur | Description | Valeur |
| -- | -- | -- |
| T~min~ | Température minimale | {{ constants.Tmin }}°C |
| T~max~ | Température maximale | {{ constants.Tmax }}°C |
| 𝜷 | Coefficient tension/température du module photovoltaïque (%/°C) | {{ panel.tempCoeffVoc }} |
| α | Coefficient courant/température du module photovoltaïque (%/°C) | {{ panel.tempCoeffIsc }} |
| U~mpptmax~ | Tension maximale de la plage MPPT de l'onduleur | {{ inverter.maxDcVoltage }} |
| U~mpptmin~ | Tension minimale de la plage MPPT de l'onduleur | {{ inverter.mpptVoltageRangeMin }} |
| I~max~ | Courant d'entrée maximal par MPPT | {{ inverter.maxInputCurrentPerMppt }} |
| I~cc~ | Courant de court circuit de l'onduleur par MPPT | {{ inverter.maxShortCircuitCurrent }} |
| I~sc~ | Courant de court circuit du panneau | {{ panel.shortCircuitCurrent }} |

## Résultats des Calculs de Température

- Vmp (à -10°C) = {{ array.Vmp_10 }} V
- Voc (à -10°C) = {{ array.Voc_10 }} V
- Vmp (à 85°C) = {{ array.Vmp_85 }} V
- Isc (à 85°C) = {{ array.Isc_85 }} A
- Imp (à 85°C) = {{ array.Imp_85 }} A

## Configuration des Panneaux

- Nombre optimal de panneaux en série (Nsoptimal) = {{ array.Nsoptimal }}
- Nombre maximal de panneaux en série (Nsmax) = {{ array.Nsmax }}
- Nombre minimal de panneaux en série (Nsmin) = {{ array.Nsmin }}
- Nombre maximal de chaînes en parallèle (Npmax) = {{ array.Npmax }}
- Nombre optimal de chaînes en parallèle (Npoptimal) = {{ array.Npoptimal }}

## Compatibilité de Puissance

- Rapport de puissance = {{ array.power_ratio }}
- Compatibilité: {% if array.is_compatible %}Compatible{% else %}Non Compatible{% endif %}

## Calculs Détaillés

**Application numérique**

Vmp (à − 10°C) = {{ panel.voltageAtPmax }} × (1 + {{ panel.tempCoeffVoc }} / 100 × ({{ constants.tempDiffCold }})) = {{ array.Vmp_10 }} V

Nsoptimal = E⁻({{ inverter.mpptVoltageRangeMax }} / {{ array.Vmp_10 }}) = {{ inverter.mpptVoltageRangeMax / array.Vmp_10 }}

Voc (à − 10°C) = {{ panel.openCircuitVoltage }} × (1 + {{ panel.tempCoeffVoc }} / 100 × ({{ constants.tempDiffCold }})) = {{ array.Voc_10 }} V

Nsmax = E⁻({{ inverter.maxDcVoltage }} / {{ array.Voc_10 }}) = {{ inverter.maxDcVoltage / array.Voc_10 }}

Vmp (à 85°C) = {{ panel.voltageAtPmax }} × (1 + {{ panel.tempCoeffVoc }} / 100 × ({{ constants.tempDiffHot }})) = {{ array.Vmp_85 }} V

Nsmin = E⁺({{ inverter.mpptVoltageRangeMin }} / {{ array.Vmp_85 }}) = {{ inverter.mpptVoltageRangeMin / array.Vmp_85 }}

Isc (à 85°C) = {{ panel.shortCircuitCurrent }} × (1 + {{ panel.tempCoeffIsc }} / 100 × ({{ constants.tempDiffHot }})) = {{ array.Isc_85 }} A

Npmax = E⁻({{ inverter.maxShortCircuitCurrent }} / {{ array.Isc_85 }}) = {{ inverter.maxShortCircuitCurrent / array.Isc_85 }}

Imp (à 85°C) = {{ panel.currentAtPmax }} × (1 + {{ panel.tempCoeffIsc }} / 100 × ({{ constants.tempDiffHot }})) = {{ array.Imp_85 }} A

Npoptimal = E⁻({{ inverter.maxInputCurrentPerMppt }} / {{ array.Imp_85 }}) = {{ inverter.maxInputCurrentPerMppt / array.Imp_85 }}
