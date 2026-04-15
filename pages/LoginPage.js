export class LoginPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        // Locators
        this.emailInput = page.locator('input[type="email"]');
        this.passwordInput = page.locator('input[type="password"]');
        this.signInButton = page.getByRole('button', { name: 'Sign in with password' });
    }

    /** Navigate to the login page */
    async goto() {
        await this.page.goto('https://company-admin-a87d4.web.app/login');
    }

    /**
     * Perform a full login
     * @param {string} email
     * @param {string} password
     */
    async login(email, password) {
        await this.emailInput.click();
        await this.emailInput.fill(email);
        await this.emailInput.press('Tab');
        await this.passwordInput.fill(password);
        await this.passwordInput.press('Enter');

    }
}