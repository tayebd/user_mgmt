export const protectionTemplate = `

# Equipements de Protection

#α is the temperature coefficient in %/°C
#α:coefficient courant/température du module photovoltaïque en %/°C
#β is the temperature coefficient in %/°C
#β: coefficient tension/température du module photovoltaïque en %/°C
#Umpptmax: the maximum MPPT voltage range of the inverter
#Umpptmax: Tension maximale de la plage MPPT de l’onduleur
#Umpptmin: the minimum MPPT voltage range of the inverter
#Umpptmin: Tension minimale de la plage MPPT de l’onduleur
#Icconduleur: the maximum short circuit current of the inverter
#Icconduleur: Courant de court circuit de l’onduleur par MPPT
#Imax is the maximum input current per MPPT of the inverter
#Imax: Courant d’entrée maximal par MPPT
#Udcmax is the maximum input voltage of the inverter
#Udcmax : tension d’entrée maximale de l’onduleur
#Isc: Courant de court circuit du panneau

# V. Dimensionnement et Dispositifs de protection coté DC :
#DC Protection Devices

## 1. Nombre maximal de chaînes en parallèle sans protection
#Maximum Number of Parallel Strings Without Protection
Ncmax ≤ (1 + (IRM / IscSTC))

**Nombre maximal de chaînes en parallèle par dispositif de protection**
Npmax ≤ 0.5 × (1 + (IRM / Isc-max))

**Application Numérique:**

Ncmax ≤ {{ protection.Ncmax_lmt }}
Npmax ≤ {{ protection.Npmax_lmt }}


## 2. Fusible DC
###DC Fuse Requirements

Exigences:
- Tension assignée d’emploi : U~fusible ≥ Vocmax (-10°C)
- Courant assigné: 1.1 Iscmax = 1.1 * 1.25 * IscSTC ≤ Ifusible ≤ Irm

**Application Numérique:**
- Tension assignée d’emploi: {{ dc_protection.fuse.Vn }} V ≥ {{ array.Voc_10 }} V
- Courant assigné: {{ panel.shortCircuitCurrent }} × 1.1 × 1.25 = {{ protection.fuse_IscSTC }} A ≤ {{ dc_protection.fuse.In }} A ≤ {{ panel.maxSeriesFuseRating }} A

- In fusible utilisé = {{ dc_protection.fuse.In }} A
- Un fusible utilisé = {{ dc_protection.fuse.Vn }} V
- Fabricant du fusible choisi: {{ dc_protection.fuse.maker }}
- Référence et type: {{ dc_protection.fuse.type }}

## 3. Interrupteur sectionneur DC
###DC Disconnect Switch

Exigences:
- Tension de l’interrupteur sectionneur Usec > Voc(-10) champ PV
- Courant de l’interrupteur sectionneur Isec > 1,25 x Isc champ PV
    (cas bifacial Isec > Isc avec gain) champ PV 

**Application Numérique:**
- Tension de l’interrupteur sectionneur: {{ dc_protection.switch.Usec }} >  {{ array.Voc_10 }} V
- Courant de l’interrupteur sectionneur : {{ dc_protection.switch.Isec }} > 1.25 x {{ panel.shortCircuitCurrent }} = {{ protection.switch_IscSTC }} A

- Courant de l’interrupteur sectionneur = {{ dc_protection.switch.Isec }} A
- Tension de l’interrupteur sectionneur = {{ dc_protection.switch.Usec }} V
- Fabricant du l’intersec choisi: {{ dc_protection.switch.maker }}
- Référence et type: {{ dc_protection.switch.ref_type }}

## 4. Parafoudre DC
###DC Surge Protector

Exigences :
- Type I ou type II
- Tension maximale de régime permanent Ucpv > Uoc max = 1.2 UocSTC
- Niveau de protection d’un parafoudre Up < 80 % de la Tension de tenue aux chocs des équipements (modules, onduleurs) et (Up < 50% pour les équipements distants de plus de 10 mètres)
- Courant nominal de décharge In > 5 kA
- Courant de tenue en court-circuit Iscpv > Iscmax PV = 1.25 IscSTC

**Application Numérique:**

- Type I
- Tension maximale de régime permanent: {{ dc_protection.lightning.Ucpv }} > {{ protection.Vocmax}}
- Courant nominal de décharge: {{ dc_protection.lightning.In }} > 5 kA
- Courant de tenue en court-circuit: Iscpv > Iscmax PV = {{ protection.Iscmax }}

- Ucpv utilisé = {{ dc_protection.lightning.Ucpv }} V DC
- Up = {{ dc_protection.lightning.Up }} kV
- In utilisé  = {{ dc_protection.lightning.In }} kA
- Iscpv utilisé = {{ dc_protection.lightning.Iscpv }} kA
- Fabricant du parafoudre choisi: {{ dc_protection.lightning.maker }}
- Référence et type: {{ dc_protection.lightning.ref_type }}

# VI. Dimensionnement Dispositifs de protection coté AC
## 1. Disjoncteur (différentiel) AC

##AC Protection Devices
###AC Circuit Breaker (Differential)

Exigences :
- Tension assignée d’emploi Ue = 230 V ou 400 V en général
- Imax onduleur ≤ le courant d’emploi (courant assigné) Ie ≤ I~z_cable_AC~
- Sensibilité : 30 mA (applications domestiques)

**Application Numérique:**

- Tension assignée d’emploi : Ue = {{ ac_protection.fuse.Vn }}
- Imax onduleur ≤ Courant d’emploi (courant assigné): {{ ac1_cable_sizing.Iz }} ≤ {{ ac_protection.fuse.In }} 
- Sensitivity: {{ ac_protection.fuse.sensitivity }} = 30 mA

- Tension assignée d’emploi  = {{ ac_protection.fuse.Vn }} V
- Courant d’emploi (courant assigné) = {{ ac_protection.fuse.In }} A
- Sensibilité = {{ ac_protection.fuse.sensitivity }}
- Fabricant du disjoncteur AC choisi: {{ ac_protection.fuse.maker }}
- Référence et type: {{ ac_protection.fuse.ref_type }}

## 2. Parafoudre AC
##AC Surge Protector

Exigences :
- Type I ou Type II
- Tension maximale de régime permanent Uc > 1.1*(Ue=230)
- Niveau de protection d’un parafoudre Up < 80 % de la tension de tenue aux chocs 
des équipements à protéger et (Up < 50% pour les équipements distants de plus de 10mètres)
- Courant nominal de décharge In > 5 Ka

**Application Numérique:**
- Type I
- Tension maximale de régime permanent: {{ ac_protection.lightning.Uc }} > 1.1 × (Ue=230)
- Courant nominal de décharge: {{ ac_protection.lightning.In }} > 5 kA

- Uc utilisé = {{ ac_protection.lightning.Uc }} kVAC
- In utilisé = {{ ac_protection.lightning.In }} kA
- Fabricant du parafoudre AC choisi: {{ ac_protection.lightning.maker }}
- Référence et type: {{ ac_protection.lightning.ref_type }}

## 3. Interrupteur sectionneur général AC
###AC Main Disconnect Switch

Exigences :
- Tension de l’interrupteur sectionneur Usec >= Uond
- Courant de l’interrupteur sectionneur Isec > nbre onduleur x Imax

**Application Numérique:**
- Tension de l’interrupteur sectionneur: {{ ac_protection.switch.Usec }} >= {{ inverter.outputVoltage }}
- Courant de l’interrupteur sectionneur: {{ ac_protection.switch.Usec }} > 1 × {{ inverter.maxOutputCurrent }} = {{ inverter.maxOutputCurrent }}

- Courant de l’interrupteur sectionneur choisi = {{ ac_protection.switch.Isec }} A
- Tension de l’interrupteur sectionneur choisi = {{ ac_protection.switch.Usec }} V
- Fabricant de l’interrupteur AC choisi: {{ ac_protection.switch.maker }}
- Référence et type: {{ ac_protection.switch.ref_type }}
`
