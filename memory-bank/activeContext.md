# Active Context

## Current Work Focus
- Implementing pagination for PVPanel data to limit the number of entries displayed at a time.
- Updating the `pvPanelController.ts` file to support pagination.
- Updating the `api.ts` file to include pagination parameters.
- Updating the `PVPanelList.tsx` file to handle pagination and display data in a table format.
- Implementing the same improvements for the Inverter object and following the style and pattern of the Company object.
- Seeding the inverter data using the `excelSeederPV.ts` script.
- Reviewing the wizard object and the wizard files to understand how the wizard is structured and how to integrate the inverter data into the wizard.
- Updating the `ProjectWizard.tsx` file to include access to the Project object and the `api.ts` file to include the necessary API calls for fetching, creating, and updating project data.
- Committing the changes to GitHub.

## Recent Changes
- Updated `pvPanelController.ts` to support pagination.
- Updated `api.ts` to include pagination parameters.
- Updated `PVPanelList.tsx` to handle pagination and display data in a table format.
- Created `inverterController.ts` and `inverterRoutes.ts` to support the Inverter object.
- Updated `index.ts` to include the `inverterRoutes`.
- Updated `excelSeederPV.ts` to include the inverter data.
- Reviewed the `ProjectWizard.tsx`, `steps/index.ts`, and `InverterStep.tsx` files to understand the wizard structure and inverter selection step.
- Updated the `ProjectWizard.tsx` file to include access to the Project object and the `api.ts` file to include the necessary API calls for fetching, creating, and updating project data.
- Committed the changes to GitHub.

## Next Steps
- Ensure the implementation is fully tested and confirmed to work as expected.
- Update the memory bank to include the information that the object is called `pVPanel` by Prisma.

## Active Decisions and Considerations
- The object in the Prisma schema is called `pVPanel`.
- Pagination parameters are set to default to page 1 and limit 50 entries per page.
- The PVPanel data is displayed in a table format with the specified fields: `manufacturer`, `modelNumber`, `description`, and `power`.
- The Inverter data is displayed in a table format with the specified fields: `manufacturer`, `modelNumber`, `description`, `phaseType`, `outputVoltage`, `maxCurrent`, and `maxPower`.
- The `excelSeederPV.ts` script is used to seed the inverter data.
- The wizard structure and inverter selection step are reviewed and understood.
- The `ProjectWizard.tsx` file is updated to include access to the Project object and the `api.ts` file to include the necessary API calls for fetching, creating, and updating project data.
- The changes are committed to GitHub.
