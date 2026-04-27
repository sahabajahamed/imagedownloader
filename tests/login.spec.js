import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import loginData from '../data/usercred.json' assert { type: 'json' };

const { validCredentials, invalidCredentials } = loginData;

test.describe('Login Page', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.goto();
        await loginPage.login(validCredentials.email, validCredentials.password);
        await loginPage.expectLoginSuccess();
    });

    for (const credentials of invalidCredentials) {
        test(`should show an error for ${credentials.name}`, async ({ page }) => {
            const loginPage = new LoginPage(page);

            await loginPage.goto();
            await loginPage.login(credentials.email, credentials.password);
            await loginPage.expectInvalidLoginError();
        });
    }
});
