-- CreateTable
CREATE TABLE "EnergyStorageSystem" (
    "id" TEXT NOT NULL,
    "manufacturerName" TEXT NOT NULL,
    "brand" TEXT,
    "modelNumber" TEXT NOT NULL,
    "technology" TEXT,
    "pvDcInputCapability" BOOLEAN NOT NULL DEFAULT false,
    "ul9540CertifyingEntity" TEXT,
    "ul9540CertificateDate" TIMESTAMP(3),
    "ul9540Edition" TEXT,
    "ul1741SupplementSbCertification" BOOLEAN NOT NULL DEFAULT false,
    "ul1741SupplementSaTesting" BOOLEAN NOT NULL DEFAULT false,
    "ul1741Sa13VoltVar" BOOLEAN NOT NULL DEFAULT false,
    "ul1741SaFreqWattVoltWatt" BOOLEAN NOT NULL DEFAULT false,
    "ul1741SaDisablePermitServiceLimitActivePower" BOOLEAN NOT NULL DEFAULT false,
    "commonSmartInverterProfileConformance" BOOLEAN NOT NULL DEFAULT false,
    "monitorKeyDataScheduling" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "nameplateEnergyCapacity" DOUBLE PRECISION,
    "nameplatePower" DOUBLE PRECISION,
    "nominalVoltage" DOUBLE PRECISION,
    "maximumContinuousDischargeRate" DOUBLE PRECISION,
    "ul1741SupplementSbCertifyingEntity" TEXT,
    "ul1741SupplementSbCertificateDate" TIMESTAMP(3),
    "ul1741SupplementSaCertifyingEntity" TEXT,
    "ul1741SupplementSaCertificateDate" TIMESTAMP(3),
    "firmwareVersionsTested" TEXT,
    "inverterCsipConformance" BOOLEAN NOT NULL DEFAULT false,
    "monitorKeyDataSchedulingAttestation" BOOLEAN NOT NULL DEFAULT false,
    "manufacturerDeclaredRoundtripEfficiency" DOUBLE PRECISION,
    "certifiedJa12ControlStrategies" BOOLEAN NOT NULL DEFAULT false,
    "declarationForJa12Submitted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "cecListingDate" TIMESTAMP(3),
    "lastUpdate" TIMESTAMP(3),

    CONSTRAINT "EnergyStorageSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inverter" (
    "id" TEXT NOT NULL,
    "manufacturerName" TEXT NOT NULL,
    "modelNumber" TEXT NOT NULL,
    "equipmentType" TEXT,
    "additionalRequiredDevices" TEXT,
    "currentMeasurementReference" TEXT,
    "description" TEXT,
    "pcsIssuerEntity" TEXT,
    "pcsDocumentDate" TIMESTAMP(3),
    "unrestrictedMode" BOOLEAN NOT NULL DEFAULT false,
    "exportOnlyMode" BOOLEAN NOT NULL DEFAULT false,
    "importOnlyMode" BOOLEAN NOT NULL DEFAULT false,
    "noExchangeMode" BOOLEAN NOT NULL DEFAULT false,
    "unrestrictedModeResponseTime" DOUBLE PRECISION,
    "exportOnlyModeResponseTime" DOUBLE PRECISION,
    "importOnlyModeResponseTime" DOUBLE PRECISION,
    "noExchangeModeResponseTime" DOUBLE PRECISION,
    "phaseType" TEXT,
    "outputVoltage" DOUBLE PRECISION,
    "maxContinuousCurrent" DOUBLE PRECISION,
    "maxContinuousPower" DOUBLE PRECISION,
    "notes" TEXT,
    "pcsListingDate" TIMESTAMP(3),
    "lastUpdate" TIMESTAMP(3),
    "inverterOrEss" TEXT,

    CONSTRAINT "Inverter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PVModule" (
    "id" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "modelNumber" TEXT NOT NULL,
    "description" TEXT,
    "safetyCertification" TEXT,
    "nameplateMaxPower" DOUBLE PRECISION,
    "ptcRating" DOUBLE PRECISION,
    "notes" TEXT,
    "designQualificationCert" TEXT,
    "performanceEvaluation" TEXT,
    "family" TEXT,
    "technology" TEXT,
    "activeArea" DOUBLE PRECISION,
    "numberOfCells" INTEGER,
    "numberOfPanels" INTEGER,
    "bipv" BOOLEAN NOT NULL DEFAULT false,
    "nameplateShortCircuitCurrent" DOUBLE PRECISION,
    "nameplateOpenCircuitVoltage" DOUBLE PRECISION,
    "nameplateMaxCurrentAtPmax" DOUBLE PRECISION,
    "nameplateVoltageAtPmax" DOUBLE PRECISION,
    "averageNoct" DOUBLE PRECISION,
    "tempCoeffPmax" DOUBLE PRECISION,
    "tempCoeffIsc" DOUBLE PRECISION,
    "tempCoeffVoc" DOUBLE PRECISION,
    "tempCoeffIpmax" DOUBLE PRECISION,
    "tempCoeffVpmax" DOUBLE PRECISION,
    "currentAtLowPower" DOUBLE PRECISION,
    "voltageAtLowPower" DOUBLE PRECISION,
    "currentAtNoct" DOUBLE PRECISION,
    "voltageAtNoct" DOUBLE PRECISION,
    "mountingType" TEXT,
    "moduleType" TEXT,
    "shortSide" DOUBLE PRECISION,
    "longSide" DOUBLE PRECISION,
    "geometricMultiplier" DOUBLE PRECISION,
    "performanceRatio" DOUBLE PRECISION,
    "cecListingDate" TIMESTAMP(3),
    "lastUpdate" TIMESTAMP(3),

    CONSTRAINT "PVModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnergyStorageSystem_modelNumber_key" ON "EnergyStorageSystem"("modelNumber");

-- CreateIndex
CREATE INDEX "EnergyStorageSystem_manufacturerName_modelNumber_idx" ON "EnergyStorageSystem"("manufacturerName", "modelNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Inverter_modelNumber_key" ON "Inverter"("modelNumber");

-- CreateIndex
CREATE INDEX "Inverter_manufacturerName_modelNumber_idx" ON "Inverter"("manufacturerName", "modelNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PVModule_modelNumber_key" ON "PVModule"("modelNumber");

-- CreateIndex
CREATE INDEX "PVModule_manufacturer_modelNumber_idx" ON "PVModule"("manufacturer", "modelNumber");
