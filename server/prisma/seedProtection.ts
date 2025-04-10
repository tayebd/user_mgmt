import { PrismaClient, DeviceType, SystemSide } from '@prisma/client';

// Create a new Prisma client instance
const prisma = new PrismaClient();

async function createSolarProtection() {
  try {
    
    // Step 2: Add DC protection devices
    // DC Fuse
    await prisma.protectionDevice.create({
      data: {
        deviceType: DeviceType.FUSE,
        side: SystemSide.DC,
        manufacturer: "TOMZN Electric",
        model: "DC25A",
        ratedVoltage: 500,
        ratedCurrent: 25,
        minRequiredVoltage: 50.68,
        minRequiredCurrent: 25.51,
        maxRequiredCurrent: 35,
        isCompliant: false,
        complianceIssue: "Missing complete model reference",
        recommendation: "Specify complete fuse model information"
      }
    });
    
    // DC Disconnect Switch
    await prisma.protectionDevice.create({
      data: {
        deviceType: DeviceType.DISCONNECT_SWITCH,
        side: SystemSide.DC,
        manufacturer: "TOMZN Electric",
        model: "TOM7Z-125",
        ratedVoltage: 1000,
        ratedCurrent: 125,
        minRequiredVoltage: 50.68,
        minRequiredCurrent: 23.19,
        isCompliant: true
      }
    });
    
    // DC Surge Protector
    await prisma.protectionDevice.create({
      data: {
        deviceType: DeviceType.SURGE_PROTECTOR,
        side: SystemSide.DC,
        manufacturer: "TOMZN Electric",
        model: "TZG40-PV",
        type: "Type 2",
        continuousOperatingVoltage: 500,
        protectionLevel: 2.5,
        nominalDischargeCurrentKA: 30,
        maxDischargeCurrentKA: 20,
        minRequiredDischargeKA: 5,
        isCompliant: true
      }
    });
    
    // Step 3: Add AC protection devices
    // AC Circuit Breaker
    await prisma.protectionDevice.create({
      data: {
        deviceType: DeviceType.CIRCUIT_BREAKER,
        side: SystemSide.AC,
        manufacturer: "TOMZN Electric",
        model: "TOM2A-125",
        ratedVoltage: 230,
        ratedCurrent: 25,
        breakingCapacity: 6,
        differentialSensitivity: 30,
        minRequiredVoltage: 230,
        minRequiredCurrent: 43,
        maxRequiredCurrent: 30,
        isCompliant: false,
        complianceIssue: "Current rating (25A) does not meet minimum requirement (43A)",
        recommendation: "Replace with higher rated circuit breaker"
      }
    });
    
    // AC Disconnect Switch
    await prisma.protectionDevice.create({
      data: {
        deviceType: DeviceType.DISCONNECT_SWITCH,
        side: SystemSide.AC,
        manufacturer: "TOMZN Electric",
        model: "TOM7C-230",
        ratedVoltage: 230,
        ratedCurrent: 50,
        minRequiredVoltage: 230,
        minRequiredCurrent: 22.7,
        isCompliant: true
      }
    });
    
    // AC Surge Protector
    await prisma.protectionDevice.create({
      data: {
        deviceType: DeviceType.SURGE_PROTECTOR,
        side: SystemSide.AC,
        manufacturer: "TOMZN Electric",
        model: "TZG40-AC",
        type: "Type 2",
        continuousOperatingVoltage: 230,
        protectionLevel: 2.5,
        nominalDischargeCurrentKA: 30,
        maxDischargeCurrentKA: 20,
        minRequiredDischargeKA: 5,
        isCompliant: true
      }
    });
    
    // Step 4: Add cables
    // DC Cable
    await prisma.wire.create({
      data: {
        side: SystemSide.DC,
        section: 4,
        currentCapacity: 30,
        maxVoltageDropPercent: 1.5,
        lengthInMeters: 15,
        isCompliant: true
      }
    });
    
    // AC Cable
    await prisma.wire.create({
      data: {
        side: SystemSide.AC,
        section: 4,
        currentCapacity: 30,
        maxVoltageDropPercent: 1.5,
        lengthInMeters: 10,
        isCompliant: true
      }
    });
    
    // Step 5: Add grounding system
    await prisma.groundingSystem.create({
      data: {
        metalPartsGrounded: true,
        cableSection: 6,
        isCompliant: true
      }
    });
    
    
    console.log("Solar Protection created successfully!");
    
  } catch (error) {
    console.error("Error creating solar Protection:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createSolarProtection();