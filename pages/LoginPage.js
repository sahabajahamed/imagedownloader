import { expect } from '@playwright/test';

export class LoginPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        this.emailInput = page.locator('input[type="email"]');
        this.passwordInput = page.locator('input[type="password"]');
        this.signInButton = page.getByRole('button', { name: 'Sign in with password' });
        this.errorMessage = page.getByText('Incorrect email or password', { exact: true });
    }

    async goto() {
        await this.page.goto('https://company-admin-a87d4.web.app/login');
    }

    /**
     * @param {string} email
     * @param {string} password
     */
    async submitLogin(email, password) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.signInButton.click();
    }

    /**
     * @param {string} email
     * @param {string} password
     */
    async login(email, password) {
        await this.submitLogin(email, password);
    }

    async expectLoginSuccess() {
        await expect(this.page).toHaveURL(/dashboard|home/, { timeout: 15000 });
    }

    async expectInvalidLoginError() {
        await expect(this.errorMessage).toBeVisible();
        await expect(this.page).toHaveURL(/login/, { timeout: 15000 });
    }
}
