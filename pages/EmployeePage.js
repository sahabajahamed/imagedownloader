import fs from 'fs';
import path from 'path';

export class EmployeePage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        // Sidebar navigation
        this.employeesNavLink = page.getByRole('link', { name: 'Employees' });

        // Employee list — first "Add employee" button (toolbar)
        this.addEmployeeButton = page.getByRole('button', { name: 'Add employee' }).first();

        // Add Employee modal form fields
        this.nameInput = page.getByRole('textbox').nth(1);
        this.roleInput = page.getByRole('textbox', { name: 'e.g. Field Technician' });
        this.phoneInput = page.getByRole('textbox', { name: '5551234567' });
        this.emailInput = page.locator("//input[@type='email']");
        this.photo = page.getByText('Upload photo');
        this.photoInput = page.locator('input[type="file"]').first();

        // Second "Add employee" button — inside the modal (submit)
        this.submitAddEmployeeButton = page.getByRole('button', { name: 'Add employee' }).nth(1);

        // Modal close button
        this.closeModalButton = page.locator('.btn-close');

        // ✅ Delete buttons — using XPath title attribute (matches all rows)
        this.allDeleteButtons = page.locator('//button[@title="Delete employee"]');
        this.confirmDeleteButton = page.getByRole('button', { name: 'Delete', exact: true });
    }

    /** Click the Employees link in the sidebar */
    async navigateToEmployees() {
        await this.employeesNavLink.click();
    }

    /** Open the Add Employee modal */
    async openAddEmployeeModal() {
        await this.addEmployeeButton.click();
    }

    /**
     * Fill in and submit the Add Employee form
     * @param {{ name: string, role: string, phone: string, email: string }} employeeData
     */
    async fillEmployeeForm({ name, role, phone, email }) {
        await this.nameInput.click();
        await this.nameInput.fill(name);

        await this.emailInput.click();
        await this.emailInput.fill(email);

        await this.roleInput.click();
        await this.roleInput.fill(role);

        await this.phoneInput.click();
        await this.phoneInput.fill(phone);
        await this.uploadDynamicPhoto();
    }

    getImageFiles() {
        const preferredDir = path.join(process.cwd(), 'tests', 'downloads', 'image');
        const fallbackDir = path.join(process.cwd(), 'tests', 'downloads');
        const imageDir = fs.existsSync(preferredDir) ? preferredDir : fallbackDir;
        const files = fs
            .readdirSync(imageDir)
            .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));

        if (!files.length) {
            throw new Error(`No image files found in: ${imageDir}`);
        }

        return { imageDir, files };
    }

    async uploadDynamicPhoto() {
        const { imageDir, files } = this.getImageFiles();
        const selectedFile = files[Math.floor(Math.random() * files.length)];
        const imagePath = path.join(imageDir, selectedFile);

        await this.photoInput.setInputFiles(imagePath);
    }

    async submitEmployeeForm() {
        await this.submitAddEmployeeButton.click();
    }

    /**
     * Fill in and submit the Add Employee form
     * @param {{ name: string, role: string, phone: string, email: string }} employeeData
     */
    async addEmployee(employeeData) {
        await this.fillEmployeeForm(employeeData);
        await this.submitEmployeeForm();
    }

    /**
     * Click on an employee row by their displayed name
     * @param {string} name
     */
    async selectEmployee(name) {
        await this.page.getByRole('cell', { name }).click();
    }

    /**
     * Delete the first employee in the list and confirm
     */
    async deleteFirstEmployee() {
        await this.allDeleteButtons.first().click();
        await this.confirmDeleteButton.click();
    }

    /**
     * Delete ALL existing employees one by one until none remain
     */
    async deleteAllEmployees() {
        while ((await this.allDeleteButtons.count()) > 0) {
            await this.allDeleteButtons.first().click();
            await this.confirmDeleteButton.click();
            // Wait for confirmation modal to fully close before next iteration
            await this.confirmDeleteButton.waitFor({ state: 'hidden' });
        }
    }

    /** Close the currently open modal */
    async closeModal() {
        await this.closeModalButton.click();
    }
}
