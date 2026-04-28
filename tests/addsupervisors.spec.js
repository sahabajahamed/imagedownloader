import { test, expect } from '@playwright/test';
import { SupervisorPage } from '../pages/SupervisorsPage';
import supervisorData from '../data/supervisor.json';
import { LoginPage } from '../pages/LoginPage';
import employeeData from '../data/supervisor.json' assert { type: 'json' };

test.describe('Supervisor Tests', () => {

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.goto();
        await loginPage.login(
            'dhl@yopmail.com',   // 🔁 replace
            'Password@800'            // 🔁 replace
        );

        // Optional: wait for dashboard/home to load
        await expect(page).toHaveURL(/dashboard|home/);
    });

    for (const data of supervisorData) {
        test(`Add Supervisor: ${data.validSupervisor.name}`, async ({ page }) => {
            const supervisorPage = new SupervisorPage(page);

            // Pass the specific entry to the Page Object method
            await supervisorPage.addSupervisor(data.validSupervisor);
            await page.waitForLoadState('networkidle');

            // Adjust based on your UI feedback (e.g., success toast or URL change)
            await expect(page).toHaveURL(/supervisors/, { timeout: 10000 });

            // Optional: Verify the record was actually added to the list
            // await expect(page.getByText(data.validSupervisor.email)).toBeVisible();
        });
    }

});