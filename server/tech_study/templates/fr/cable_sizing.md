# VII. Dimensionnement Câble DC/AC

Exigences :
- La température ambiante utilisée pour dimensionner les câbles DC/AC :
- Enterré : 25 °C
- Dans un Local technique : 50 °C
- Dans un chemin de câble non exposé au soleil : 50 °C
- Dans un chemin de câble exposé au soleil : 80 °C

# 1. Câbles DC

Le choix du courant admissible Iz des câbles de chaînes PV doit tenir compte des 
différents facteurs de correction définis dans l’NF C 15-100.

Courant admissible :
Iz’ = Iz \* (K1 \* K2 \* K3 \* K4) A calculer

Avec :

| Valeur  |  <div style="width:350px">Description</div>|
| -- | -- |
Iz’|Courant maximum admissible du câble choisi en tenant compte des conditions de pose
Iz|Courant admissible du câble choisi
K1|Facteur de correction prenant en compte le mode de pose
K2|Facteur de correction prenant en compte l’influence mutuelle des circuits placés côte à côte (groupement de circuits)
K3|Facteur de correction prenant en compte la température ambiante et la nature de l’isolant
K4|Facteur de correction prenant en compte le nombre de couches de câble dans un chemin de câbles


Câbles DC : Le choix du courant admissible Iz des câbles de chaînes PV doit tenir compte des différents facteurs de correction définis dans l'NF C 15-100.

Courant admissible :

Iz' = Iz * (K1 * K2 * K3 * K4) A calculer

Iz' = 43 * 1 * 0,94 * 0,80 * 0,41 = 13,26A (Dans un chemin de câble exposé au soleil : 80°C)

Iz' = 43 * 1 * 0,94 * 0,80 * 1,04 = 33,63A (Dans un chemin de câble exposé au soleil : 25°C)

Iz' = 43 * 1 * 0,94 * 0,80 * 0,82 = 26,52A (Dans un chemin de câble exposé au soleil : 50°C)


# Dimensionnement Câble DC/AC
#DC and AC Cable Sizing
Exigences :
- La température ambiante utilisée pour dimensionner les câbles DC/AC :
- Enterré : 25 °C
- Dans un Local technique : 50 °C
- Dans un chemin de câble non exposé au soleil : 50 °C
- Dans un chemin de câble exposé au soleil : 80 °C

#### Câbles DC

Le choix du courant admissible Iz des câbles de chaînes PV doit tenir compte des 
différents facteurs de correction définis dans l’NF C 15-100.

Courant admissible :
Iz’ = Iz \* (K1 \* K2 \* K3 \* K4) A calculer

Avec :

| Valeur  |  <div style="width:350px">Description</div> |
| -- | -- |
Iz’|Courant maximum admissible du câble choisi en tenant compte des conditions de pose
Iz|Courant admissible du câble choisi
K1|Facteur de correction prenant en compte le mode de pose
K2|Facteur de correction prenant en compte l’influence mutuelle des circuits placés côte à côte (groupement de circuits)
K3|Facteur de correction prenant en compte la température ambiante et la nature de l’isolant
K4|Facteur de correction prenant en compte le nombre de couches de câble dans un chemin de câbles

**Application Numérique:**

- Dans un chemin de câble exposé au soleil, 80°C: Iz' = {{ dc_cable_sizing.Iz }} × {{ constants.K1 }} × {{ constants.K2 }} × {{ constants.K3 }} × {{ constants.K4_80C }} = {{ cable_sizing.dc_Iz_prime_80C }} A
- Dans un chemin de câble exposé au soleil, 25°C: Iz' = {{ dc_cable_sizing.Iz }} × {{ constants.K1 }} × {{ constants.K2 }} × {{ constants.K3 }} × {{ constants.K4_25C }} = {{ cable_sizing.dc_Iz_prime_25C }} A
- Dans un chemin de câble exposé au soleil, 50°C: Iz' = {{ dc_cable_sizing.Iz }} × {{ constants.K1 }} × {{ constants.K2 }} × {{ constants.K3 }} × {{ constants.K4_50C }} = {{ cable_sizing.dc_Iz_prime_50C }} A

#### Modes de pose

{{ dc_cable.installationMethod }}

### Méthodes de référence

{{ dc_cable.referenceMethod }}

### Groupement de circuits

{{ dc_cable.circuitGrouping }}

### Facteurs de correction pour pose en plusieurs couches

{{ dc_cable.layerFactors }}

### Température ambiante

{{ dc_cable.temperatureFactors }}

### Nombre de couches

{{ dc_cable.numberLayers }}

### Soil Thermal Resistivity

{{ dc_cable.soilResistivity }}

**Conclusion:**

| DC Cable Current Capacity | Section | Current Capacity Iz | Corrected Current Iz' |
|--------------------------|---------|---------------------|------------------------|
| {{ dc_cable_sizing.Iz }} A   | {{ dc_cable_sizing.section }} mm2 | {{ dc_cable_sizing.Iz }} A | {{ cable_sizing.dc_Iz_prime_25C }} A |

###DC Voltage Drop Calculation
## 2. Calcul de chute de tension DC

Δu = 2 × ρ × L/S × ImpSTC
​Δu (en %) = 100 × Δu/Ump

La chute de tension totale est limité à 3% .

ρ = {{ constants.resistivity_cu }} Ωmm²/m pour le cuivre et ρ = {{ constants.resistivity_al }} Ωmm²/m our l'aluminium

La chute de tension doit se calculer pour tous les tronçons.

| Section | ρ (Ωmm²/m) | L(m) | I(A) | Section(mm²) | V | Δu | Δu% |
|---------|------------|------|------|--------------|---|-----|-----|
| PV String 1_inv1 | {{ constants.resistivity_cu }} | {{ dc_cable_sizing.length }} | {{ dc_cable_sizing.Iz }} | {{ dc_cable_sizing.section }} | {{ dc_cable.voltage }} | {{ dc_cable_sizing.delta_u }} | {{ dc_cable_sizing.delta_u_perc }} |

**Conclusion:**

On a choisi une section de: {{ dc_cable_sizing.section }}mm² avec un Δu (en %) = {{ dc_cable_sizing.delta_u_perc }}%

### Caractéristiques des câbles DC minimales**

Le câble doit avoir les caractéristiques techniques minimales suivantes :

- Type de câble : unipolaire, double isolation, résistant aux ultraviolets ;
    - Section des câbles : normalisée
    - Respect des normes des câbles pour courant continu

Ainsi, il est prévu que :

- La température maximale admissible sur l’âme en régime permanent est de 90°C ou 120°C. (isolation PRC)
    - La température maximale admissible sur l’âme en régime de court-circuit est de 250°C.
    - Tension maximale en courant continu : 1,8 kV.
    - Tension assignée en courant alternatif : U0/U : 0,6/1 (1,2) kV
        - U0 : la valeur efficace entre l'âme d'un conducteur
        - U : la valeur efficace entre les âmes conductrices de deux conducteurs

## 3. Câble AC

Le choix du courant admissible Iz des câbles AC doit tenir compte des différents facteurs de correction définis dans l’NF C 15-100.

Courant admissible :
Iz’ = Iz \* (K1 \* K2 \* K3 \* K4) A calculer

Avec :

| Valeur  |  <div style="width:350px">Description</div>  |
| -- | -- |
Iz’|Courant maximum admissible du câble choisi en tenant compte des conditions de pose
Iz|Courant admissible du câble choisi
K1|Facteur de correction prenant en compte le mode de pose
K2|Facteur de correction prenant en compte l’influence mutuelle des circuits placés côte à côte (groupement de circuits)
K3|Facteur de correction prenant en compte la température ambiante et la nature de l’isolant
K4|Facteur de correction prenant en compte le nombre de couches de câble dans un chemin de câbles

**Application Numérique:**
- Dans un chemin de câble exposé au soleil, 80°C: Iz' = {{ ac1_cable_sizing.Iz }} × {{ constants.K1 }} × {{ constants.K2 }} × {{ constants.K3 }} × {{ constants.K4_80C }} = {{ cable_sizing.dc_Iz_prime_80C }} A
- Dans un chemin de câble exposé au soleil, 25°C: Iz' = {{ ac1_cable_sizing.Iz }} × {{ constants.K1 }} × {{ constants.K2 }} × {{ constants.K3 }} × {{ constants.K4_25C }} = {{ cable_sizing.dc_Iz_prime_25C }} A
- Dans un chemin de câble exposé au soleil, 50°C: Iz' = {{ ac1_cable_sizing.Iz }} × {{ constants.K1 }} × {{ constants.K2 }} × {{ constants.K3 }} × {{ constants.K4_50C }} = {{ cable_sizing.dc_Iz_prime_50C }} A


#### Modes de pose

{{ ac_cable.installationMethod }}

### Méthodes de référence

{{ ac_cable.referenceMethod }}

### Groupement de circuits

{{ ac_cable.circuitGrouping }}

### Facteurs de correction pour pose en plusieurs couches

{{ ac_cable.layerFactors }}

### Température ambiante

{{ ac_cable.temperatureFactors }}

### Nombre de couches

{{ ac_cable.numberLayers }}

### Résistivité thermique de sol

{{ ac_cable.soilResistivity }}


**Conclusion:**

| AC Cable Current Capacity | Section | Corrected Current | Current Capacity |
|--------------------------|---------|-------------------|------------------|
| {{ ac1_cable_sizing.Iz }}   | {{ ac1_cable_sizing.section }} | {{ ac1_cable_sizing.Iz_prime_25C }} | {{ ac1_cable_sizing.Iz }} |

## 4. Chute de tension AC :

La chute de tension doit se calculer pour tous les tronçons jusqu’au point d’injection.

∆u = b (ρ × L/S × cosφ + λ × L × sinφ) × Imax_ond

Δu (%) = 100 × ∆u / Ve

La chute de tension totale est limitée à 3%.

Avec:
- b = 1 for pour les circuits triphasés et b=2 pour les circuits monophasés
- ρ = {{ constants.resistivity_cu }} Ωmm²/m pour le cuivre, et ρ = {{ constants.resistivity_al }} Ωmm²/m pour l'aluminium

| Section | b | ρ | L | I | S | λ | cos(φ) | sin(φ) | V | ∆u | Δu (%) |
|---------|---|---|---|---|---|---|--------|--------|---|-----|--------|
| Inverter -> AC panel | 2 | 0.02314 | {{ ac1_cable_sizing.length }} | {{ inverter.maxOutputCurrent }} | {{ ac1_cable_sizing.section }} | 0.00008 | 0.8 | 0.6 | 230 | {{ ac1_cable_sizing.delta_u }} | {{ ac1_cable_sizing.delta_u_perc }} |
| AC panel -> TGBT | 2 | 0.02314 | {{ ac2_cable_sizing.length }} | {{ inverter.maxOutputCurrent }} | {{ ac1_cable_sizing.section }} | 0.00008 | 0.8 | 0.6 | 230 | {{ ac2_cable_sizing.delta_u }} | {{ ac2_cable_sizing.delta_u_perc }} |


**Conclusion:**

∆utot = ∆u1 + ∆u2 = {{ ac2_cable_sizing.delta_u_perc }} + {{ ac2_cable_sizing.delta_u_perc }} =  {{ ac1_cable_sizing.delta_u_perc }}
avec ∆u1 est la chute de tension entre onduleur et coffret Ac et
∆u2 est la chute de tension entre coffret AC et TGBT

Total voltage drop: {{ ac1_cable_sizing.delta_u_perc }} % < 3%

# VIII. Description du câblage des panneaux et de la mise à la terre

Le câblage des panneaux doit se faire conformément au référentiel STEG afin de minimiser la boucle d’induction
A Choisir la section des câbles de mise à la terre conformément au référentiel STEG

# IX. Description Description de la mise en œuvre de la structure
A décrire
Prévoir une attestation de conformité pour un prototype fournit par un bureau de contrôle que
la structure supporte les charges de l’IPV et un vent de 120km/h (note de calcul et construction)

# X. Système de comptage 
