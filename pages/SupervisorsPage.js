import { expect } from '@playwright/test';

export class SupervisorPage {


    constructor(page) {
        this.page = page;

        // Locators
        this.supervisorsLink = page.getByRole('link', { name: 'Supervisors' });
        this.addSupervisorBtn = page.getByRole('button', { name: 'Add supervisor' });

        this.nameInput = page.locator('#supervisor-form input[type="text"]');
        this.emailInput = page.locator('input[type="email"]');
        this.passwordInput = page.getByRole('textbox', { name: 'Min 8 characters' });
        this.phoneInput = page.getByRole('textbox', { name: '5551234567' });
        this.addressTextarea = page.locator('textarea');

        this.saveBtn = page.getByRole('button', {
            name: 'Save and send credentials',
        });
    }

    async navigateToSupervisorPage() {
        await this.supervisorsLink.click();
    }

    async clickAddSupervisor() {
        await this.addSupervisorBtn.click();
    }

    async fillSupervisorForm(data) {
        await this.nameInput.fill(data.name);
        await this.emailInput.fill(data.email);
        await this.passwordInput.fill(data.password);
        await this.phoneInput.fill(data.phone);
        await this.addressTextarea.fill(data.address);
    }

    async submitForm() {
        await this.saveBtn.click();
        // Waits until there are no network connections for at least 500ms
        await this.page.waitForLoadState('networkidle');
    }

    async addSupervisor(data) {
        await this.navigateToSupervisorPage();
        await this.clickAddSupervisor();
        await this.fillSupervisorForm(data);
        await this.submitForm();
        ;
    }
}