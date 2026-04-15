import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { EmployeePage } from '../pages/EmployeePage';
import employeeData from '../data/employee.json' assert { type: 'json' };

// ─── Test Data (loaded from data/employee.json) ───────────────────────────────
const { credentials, employees } = employeeData;

// ─── Tests ───────────────────────────────────────────────────────────────────
test.describe('Employee Management', () => {
    let loginPage;
    let employeePage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        employeePage = new EmployeePage(page);

        await loginPage.goto();
        await loginPage.login(credentials.email, credentials.password);
        await employeePage.navigateToEmployees();
    });

    // ── Add Employee ────────────────────────────────────────────────────────────
    test.describe('Add Employee', () => {
        for (const employee of employees) {
            test(`should add employee: ${employee.name}`, async ({ page }) => {
                await employeePage.openAddEmployeeModal();
                await employeePage.addEmployee(employee);

                // Assert the new employee appears in the table
                await expect(page.getByRole('cell', { name: employee.name })).toBeVisible();

                // Open employee detail and close it
                await employeePage.selectEmployee(employee.name);
                await employeePage.closeModal();
            });
        }
    });

    // ── Delete Employee ─────────────────────────────────────────────────────────
    test.describe('Delete Employee', () => {
        test('should delete the first employee in the list', async ({ page }) => {
            await employeePage.deleteFirstEmployee();

            // Assert the confirmation modal is dismissed
            await expect(page.getByRole('button', { name: 'Delete', exact: true })).not.toBeVisible();
        });

        test('should delete ALL employees from the list', async ({ page }) => {
            const allDeleteButtons = page.locator('//button[@title="Delete employee"]');

            // Skip test if no employees exist
            const initialCount = await allDeleteButtons.count();
            test.skip(initialCount === 0, 'No employees to delete');

            // Delete all employees
            await employeePage.deleteAllEmployees();

            // Assert no delete buttons remain — list is empty
            await expect(deleteButtons).toHaveCount(0);
        });
    });
});