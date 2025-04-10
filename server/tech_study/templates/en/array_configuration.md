# Solar Array Configuration

## Maximum Number of Panels in Series (Inverter Protection)

Nsmax = $E^{-}(\frac{Udcmax}{Voc (at -10^{\circ}C)})$

Where:
- Voc (at -10°C) = Voc × (1 + β/100 × (-10 - 25°C))
- β is the temperature coefficient in %/°C
- Tmin = -10°C
- Udcmax is the maximum input voltage of the inverter

**Numerical Application:**

Voc (at -10°C) = {{ panel.voltageAtPmax }} × (1 + {{ panel.tempCoeffVoc }}/100 × (-35)) = {{ array.Voc_10 }} V
Nsmax = E⁻({{ inverter.maxDcVoltage }} / {{ array.Voc_10 }}) = {{ array.Nsmax }}

## Optimal Number of Panels in Series

Nsoptimal = $E^{-}(\frac{Umpptmax}{Vmp (at -10^{\circ}C)})$

Where:
- Vmp (at -10°C) = Vmp × (1 + β/100 × (-10 - 25°C))
- β is the temperature coefficient in %/°C
- Tmin = -10°C
- Umpptmax is the maximum MPPT voltage range of the inverter

**Numerical Application:**

Vmp (at -10°C) = {{ panel.voltageAtPmax }} × (1 + {{ panel.tempCoeffVoc }}/100 × (-35)) = {{ array.Vmp_10 }} V
Nsoptimal = E⁻({{ inverter.maxDcVoltage }} / {{ array.Vmp_10 }}) = {{ array.Nsoptimal }}

## Minimum Number of Panels in Series

Nsmin = $E^{+}(\frac{Umpptmin}{Vmp (at 85^{\circ}C)})$

Where:
- Vmp (at 85°C) = Vmp × (1 + β/100 × (85 - 25°C))
- β is the temperature coefficient in %/°C
- Tmax = 85°C
- Umpptmin is the minimum MPPT voltage range of the inverter

**Numerical Application:**

Vmp (at 85°C) = {{ panel.voltageAtPmax }} × (1 + {{ panel.tempCoeffVoc }}/100 × 60) = {{ array.Vmp_85 }} V
Nsmin = E⁺({{ inverter.mpptVoltageRangeMin }} / {{ array.Vmp_85 }}) = {{ array.Nsmin }}

## Maximum Number of Parallel Strings (Short Circuit Protection)

Npmax = $E^{-}(\frac{Icconduleur}{Isc (at 85^{\circ}C)})$

Where:
- Isc (at 85°C) = Isc × (1 + α/100 × (Tmax - 25°C))
- α is the temperature coefficient in %/°C
- Tmax = 85°C
- Icconduleur is the maximum short circuit current of the inverter

**Numerical Application:**

Isc (at 85°C) = {{ panel.shortCircuitCurrent }} × (1 + {{ panel.tempCoeffIsc }}/100 × 60) = {{ array.Isc_85 }} A
Npmax = E⁻({{ inverter.maxShortCircuitCurrent }} / {{ array.Isc_85 }}) = {{ array.Npmax }}

## Optimal Number of Parallel Strings

Npoptimal = $E^{-}(\frac{Imax}{Imp (at 85^{\circ}C)})$

Where:
- Imp (at 85°C) = Imp × (1 + α/100 × (Tmax - 25°C))
- α is the temperature coefficient in %/°C
- Tmax = 85°C
- Imax is the maximum input current per MPPT of the inverter

**Numerical Application:**

Imp (at 85°C) = {{ panel.currentAtPmax }} × (1 + {{ panel.tempCoeffIsc }}/100 × 60) = {{ array.Imp_85 }} A
Npoptimal = E⁻({{ inverter.maxInputCurrentPerMppt }} / {{ array.Imp_85 }}) = {{ array.Npoptimal }}

## Power Compatibility

The power ratio between the PV generator and the inverter nominal AC power must be between 0.9 and 1.3:

$0.9 \leq \frac{Pcpv}{Pac_ond} \leq 1.3$

**Numerical Application:**

Npv = Pc/Ppv = {{ array.array_power }} / {{ panel.maxPower }} ~ {{ project.numberPanels }} panels.
Power ratio = {{ array.array_power }} / {{ inverter.nominalOutputPower }} = {{ array.power_ratio }}
