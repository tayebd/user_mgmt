export const arrayConfigurationTemplate = `

## 3. Caractéristiques des équipements DC et AC 
#DC and AC Protection Devices

| Equipement | Caractéristiques techniques |
| -- | -- |
| Fusibles | U~fusible~ = {{ dc_protection.fuse.Vn }}<br> I~fusible~ = {{ dc_protection.fuse.In }} |
| Parafoudre DC | Type 2<br>Ucpv = {{ dc_protection.lightning.Ucpv }}<br>Up = {{ dc_protection.lightning.Up }}<br>In = {{ dc_protection.lightning.In }} {{ dc_protection.lightning.InUnit }}<br>Iscpv = {{ dc_protection.lightning.Iscpv }} {{ dc_protection.lightning.IscpvUnit }} |
| Interrupteur sectionneur DC | Usec = {{ dc_protection.switch.Usec }}<br>Isec = {{ dc_protection.switch.Isec }} |
| Disjoncteur (différentiel) AC | Udis = {{ ac_protection.switch.Usec }}<br>In = {{ ac_protection.fuse.In }}<br>Pouvoir de coupure = 6kA<br>Sensibilité = 30mA |
| Parafoudre AC | Type 2<br>Uc = {{ ac_protection.lightning.Uc }}<br>Up = {{ ac_protection.lightning.Up }}<br>In = {{ ac_protection.lightning.In }} {{ ac_protection.lightning.InUnit }}<br>Isc = {{ ac_protection.lightning.Isc }} {{ ac_protection.lightning.IscUnit }} |
| Section câbles DC | Section = {{ dc_cable_sizing.section }}<br>Courant admissible Iz = 30A |
| Section câbles AC | Section = {{ ac1_cable_sizing.section }}<br>Courant admissible Iz = 30A |

**Le bâtiment n'est pas équipé d’un paratonnerre ou d’un groupe électrogène.**

## 4. Compatibilité de l’onduleur :

Tmin : Température minimale du module prise égale à -10°C
Tmax : Température maximale du module prise égale à 85°C
𝜷: coefficient tension/température du module photovoltaïque donnée par le fabricant du module en %/°C
α : coefficient courant/température du module photovoltaïque donnée par le fabricant du module en %/°C
Umpptmax :Tension maximale de la plage MPPT de l’onduleur
Umpptmin :Tension minimale de la plage MPPT de l’onduleur
Imax : le courant d’entrée maximal par mppt
Icc : le courant de court circuit de l’onduleur par mppt
Isc: le courant de court circuit du panneau

#Solar Array Configuration
## Nombre maximal de panneau en série (protection onduleur – champ PV)
##Maximum Number of Panels in Series (Inverter Protection)

Nsmax = $E^{-}(\frac{Udcmax}{Voc (at -10^{\circ}C)})$

Where:
- Voc (à -10°C) = Voc × (1 + β/100 × (-10 - 25°C))
- β: coefficient tension/température du module photovoltaïque en %/°C
- Tmin = -10°C
- Udcmax : tension d’entrée maximale de l’onduleur

**Application Numérique:**

Voc (at -10°C) = {{ panel.voltageAtPmax }} × (1 + {{ panel.tempCoeffVoc }}/100 × (-35)) = {{ array.Voc_10 }} V
Nsmax = E⁻({{ inverter.maxDcVoltage }} / {{ array.Voc_10 }}) = {{ array.Nsmax }}

### Nombre optimal de panneau en série
##Optimal Number of Panels in Series

Nsoptimal = $E^{-}(\frac{Umpptmax}{Vmp (at -10^{\circ}C)})$

Ou:
- Vmp (à -10°C) = Vmp × (1 + β/100 × (-10 - 25°C))
- β: coefficient tension/température du module photovoltaïque en %/°C
- Tmin = -10°C
- Umpptmax: Tension maximale de la plage MPPT de l’onduleur

**Application Numérique:**

Vmp (à -10°C) = {{ panel.voltageAtPmax }} × (1 + {{ panel.tempCoeffVoc }}/100 × (-35)) = {{ array.Vmp_10 }} V
Nsoptimal = E⁻({{ inverter.maxDcVoltage }} / {{ array.Vmp_10 }}) = {{ array.Nsoptimal }}

### Nombre minimal de panneau en série
##Minimum Number of Panels in Series

Nsmin = $E^{+}(\frac{Umpptmin}{Vmp (at 85^{\circ}C)})$

Ou:
- Vmp (à 85°C) = Vmp × (1 + β/100 × (85 - 25°C))
- β: coefficient tension/température du module photovoltaïque en %/°C
- Tmax = 85°C
- Umpptmin: Tension minimale de la plage MPPT de l’onduleur

**Application Numérique:**

Vmp (at 85°C) = {{ panel.voltageAtPmax }} × (1 + {{ panel.tempCoeffVoc }}/100 × 60) = {{ array.Vmp_85 }} V
Nsmin = E⁺({{ inverter.mpptVoltageRangeMin }} / {{ array.Vmp_85 }}) = {{ array.Nsmin }}

## Nombre maximal de chaines en parallèle (protection - cas cc)
##Maximum Number of Parallel Strings (Short Circuit Protection)

Npmax = $E^{-}(\frac{Icconduleur}{Isc (at 85^{\circ}C)})$

Ou:
- Isc (à 85°C) = Isc × (1 + α/100 × (Tmax - 25°C))
- α:coefficient courant/température du module photovoltaïque en %/°C
- Tmax = 85°C
- Icconduleur: Courant de court circuit de l’onduleur par MPPT

**Application Numérique:**

Isc (à 85°C) = {{ panel.shortCircuitCurrent }} × (1 + {{ panel.tempCoeffIsc }}/100 × 60) = {{ array.Isc_85 }} A
Npmax = E⁻({{ inverter.maxShortCircuitCurrent }} / {{ array.Isc_85 }}) = {{ array.Npmax }}

### Nombre optimal de chaines en parallele
##Optimal Number of Parallel Strings

Npoptimal = $E^{-}(\frac{Imax}{Imp (at 85^{\circ}C)})$

Where:
- Imp (à 85°C) = Imp × (1 + α/100 × (Tmax - 25°C))
- α:coefficient courant/température du module photovoltaïque en %/°C
- Tmax = 85°C
- Imax: Courant d’entrée maximal par MPPT

**Application Numérique:**

Imp (à 85°C) = {{ panel.currentAtPmax }} × (1 + {{ panel.tempCoeffIsc }}/100 × 60) = {{ array.Imp_85 }} A
Npoptimal = E⁻({{ inverter.maxInputCurrentPerMppt }} / {{ array.Imp_85 }}) = {{ array.Npoptimal }}

### Compatibilité en puissance

Les puissances du générateur photovoltaïque et de l’onduleur doivent être mutuellement accordées. 
Le rapport entre La puissance du générateur photovoltaïque et la puissance nominale AC des onduleurs 
doit être compris entre 0.9 et 1.3.

$0.9 \leq \frac{Pcpv}{Pac_ond} \leq 1.3$

**Application Numérique:**

Npv = Pc/Ppv = {{ array.array_power }} / {{ panel.maxPower }} ~ {{ project.numberPanels }} panels.
Rapport entre puissances = {{ array.array_power }} / {{ inverter.nominalOutputPower }} = {{ array.power_ratio }}
`