import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { EmployeePage } from '../pages/EmployeePage';
import employeeData from '../data/employee.json' assert { type: 'json' };

const { credentials, employees } = employeeData;

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

    for (const employee of employees) {
        test(`should create employee: ${employee.name}`, async ({ page }) => {
            await employeePage.openAddEmployeeModal();
            await employeePage.addEmployee(employee);

            await expect(page.getByRole('cell', { name: employee.name })).toBeVisible();

            await employeePage.selectEmployee(employee.name);
            await employeePage.closeModal();
        });
    }
});
