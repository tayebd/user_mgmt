# Calculs et Dimensionnement

## Paramètres de Température

| Valeur | Description | Valeur |
| -- | -- | -- |
| T~min~ | Température minimale | {{ project.temperature.Tmin }}°C |
| T~max~ | Température maximale | {{ project.temperature.Tmax }}°C |
| 𝜷 | Coefficient tension/température du module photovoltaïque (%/°C) | {{ panel.tempCoeffVoc }} |
| α | Coefficient courant/température du module photovoltaïque (%/°C) | {{ panel.tempCoeffIsc }} |
| U~mpptmax~ | Tension maximale de la plage MPPT de l'onduleur | {{ inverter.maxDcVoltage }} |
| U~mpptmin~ | Tension minimale de la plage MPPT de l'onduleur | {{ inverter.mpptVoltageRangeMin }} |
| I~max~ | Courant d'entrée maximal par MPPT | {{ inverter.maxInputCurrentPerMppt }} |
| I~cc~ | Courant de court circuit de l'onduleur par MPPT | {{ inverter.maxShortCircuitCurrent }} |
| I~sc~ | Courant de court circuit du panneau | {{ panel.shortCircuitCurrent }} |

## Résultats des Calculs de Température

- Vmp (à -10°C) = {{ results.temperature_effects.Vmp_minus_10C }} V
- Voc (à -10°C) = {{ results.temperature_effects.Voc_minus_10C }} V
- Vmp (à 85°C) = {{ results.temperature_effects.Vmp_at_85C }} V
- Isc (à 85°C) = {{ results.temperature_effects.Isc_at_85C }} A
- Imp (à 85°C) = {{ results.temperature_effects.Imp_at_85C }} A

## Configuration des Panneaux

- Nombre optimal de panneaux en série (Nsoptimal) = {{ results.panel_configuration.Nsoptimal }}
- Nombre maximal de panneaux en série (Nsmax) = {{ results.panel_configuration.Nsmax }}
- Nombre minimal de panneaux en série (Nsmin) = {{ results.panel_configuration.Nsmin }}
- Nombre maximal de chaînes en parallèle (Npmax) = {{ results.panel_configuration.Npmax }}
- Nombre optimal de chaînes en parallèle (Npoptimal) = {{ results.panel_configuration.Npoptimal }}

## Compatibilité de Puissance

- Rapport de puissance = {{ results.power_compatibility.power_ratio }}
- Compatibilité: {% if results.power_compatibility.is_compatible %}Compatible{% else %}Non Compatible{% endif %}

## Calculs Détaillés

**Application numérique**

Vmp (à − 10°C) = {{ panel.voltageAtPmax }} × (1 + {{ panel.tempCoeffVoc }} / 100 × ({{ project.temperature.tempDiffCold }})) = {{ results.temperature_effects.Vmp_minus_10C }} V

Nsoptimal = E⁻({{ inverter.mpptVoltageRangeMax }} / {{ results.temperature_effects.Vmp_minus_10C }}) = {{ inverter.mpptVoltageRangeMax / results.temperature_effects.Vmp_minus_10C | round(2) }}

Voc (à − 10°C) = {{ panel.openCircuitVoltage }} × (1 + {{ panel.tempCoeffVoc }} / 100 × ({{ project.temperature.tempDiffCold }})) = {{ results.temperature_effects.Voc_minus_10C }} V

Nsmax = E⁻({{ inverter.maxDcVoltage }} / {{ results.temperature_effects.Voc_minus_10C }}) = {{ inverter.maxDcVoltage / results.temperature_effects.Voc_minus_10C | round(2) }}

Vmp (à 85°C) = {{ panel.voltageAtPmax }} × (1 + {{ panel.tempCoeffVoc }} / 100 × ({{ project.temperature.tempDiffHot }})) = {{ results.temperature_effects.Vmp_at_85C }} V

Nsmin = E⁺({{ inverter.mpptVoltageRangeMin }} / {{ results.temperature_effects.Vmp_at_85C }}) = {{ inverter.mpptVoltageRangeMin / results.temperature_effects.Vmp_at_85C | round(2) }}

Isc (à 85°C) = {{ panel.shortCircuitCurrent }} × (1 + {{ panel.tempCoeffIsc }} / 100 × ({{ project.temperature.tempDiffHot }})) = {{ results.temperature_effects.Isc_at_85C }} A

Npmax = E⁻({{ inverter.maxShortCircuitCurrent }} / {{ results.temperature_effects.Isc_at_85C }}) = {{ inverter.maxShortCircuitCurrent / results.temperature_effects.Isc_at_85C | round(2) }}

Imp (à 85°C) = {{ panel.currentAtPmax }} × (1 + {{ panel.tempCoeffIsc }} / 100 × ({{ project.temperature.tempDiffHot }})) = {{ results.temperature_effects.Imp_at_85C }} A

Npoptimal = E⁻({{ inverter.maxInputCurrentPerMppt }} / {{ results.temperature_effects.Imp_at_85C }}) = {{ inverter.maxInputCurrentPerMppt / results.temperature_effects.Imp_at_85C | round(2) }}
