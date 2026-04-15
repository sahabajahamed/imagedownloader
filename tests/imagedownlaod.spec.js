const { test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const DOWNLOAD_TARGET = 50;
const MAX_NO_CHANGE_STREAK = 4;
const MIN_IMAGES_BEFORE_LOAD_MORE = 5;
const LOAD_MORE_SELECTOR = 'button:has-text("Load more"), a:has-text("Load more"), [role="button"]:has-text("Load more")';

// 🔥 CHANGE URL HERE ONLY
const SEARCH_URL = 'https://unsplash.com/s/photos/gym ';

test.setTimeout(300000);

test('Download Unsplash images with dynamic naming', async ({ page }) => {

    // ✅ Extract keyword from URL
    const keyword = SEARCH_URL.split('/').pop(); // biryani
    const formattedName = keyword.charAt(0).toUpperCase() + keyword.slice(1);

    // 📁 Create folder
    const downloadPath = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true });
    }

    await page.goto(SEARCH_URL, { waitUntil: 'load' });

    const imageLocators = page.locator(
        'figure[data-testid="asset-grid-masonry-figure"] img[src*="photo-"]:not([role="presentation"]):not([class*="avatar"])'
    );

    await page.waitForSelector('figure[data-testid="asset-grid-masonry-figure"] img');

    let loadedCount = await imageLocators.count();
    let noChangeStreak = 0;

    if (loadedCount < MIN_IMAGES_BEFORE_LOAD_MORE) {
        const loadMoreButton = page.locator(LOAD_MORE_SELECTOR);
        if (await loadMoreButton.count()) {
            console.log('Fewer than 5 images loaded, clicking Load more button...');
            await loadMoreButton.first().click();
            await page.waitForTimeout(3000);
            loadedCount = await imageLocators.count();
        }
    }

    // 🔄 Scroll
    while (loadedCount < DOWNLOAD_TARGET && noChangeStreak < MAX_NO_CHANGE_STREAK) {
        await page.mouse.wheel(0, 3000);
        await page.waitForTimeout(2000);

        const newCount = await imageLocators.count();

        if (newCount === loadedCount) {
            noChangeStreak++;
        } else {
            loadedCount = newCount;
            noChangeStreak = 0;
        }
    }

    const downloadCount = Math.min(loadedCount, DOWNLOAD_TARGET);
    console.log(`Downloading ${downloadCount} images for "${formattedName}"`);

    let savedCount = 1;

    for (let i = 0; i < downloadCount; i++) {
        const img = imageLocators.nth(i);
        await img.scrollIntoViewIfNeeded();

        const src = await img.getAttribute('src');
        const srcset = await img.getAttribute('srcset');

        let imageUrl = null;

        // ✅ Get best quality
        if (srcset) {
            const candidates = srcset
                .split(',')
                .map(s => s.trim().split(' ')[0])
                .filter(url =>
                    url.includes('/photo-') &&
                    !url.includes('/profile-') &&
                    !url.startsWith('data:')
                );

            if (candidates.length) {
                imageUrl = candidates[candidates.length - 1];
            }
        }

        if (!imageUrl && src &&
            src.includes('/photo-') &&
            !src.includes('/profile-') &&
            !src.startsWith('data:')
        ) {
            imageUrl = src;
        }

        if (!imageUrl) continue;

        try {
            const response = await page.request.get(imageUrl);
            if (!response.ok()) continue;

            const buffer = await response.body();

            // ✅ Dynamic file naming
            const fileName = `${formattedName}_${String(savedCount).padStart(2, '0')}.jpg`;

            fs.writeFileSync(path.join(downloadPath, fileName), buffer);

            console.log(`Downloaded: ${fileName}`);
            savedCount++;

        } catch (err) {
            console.log(`Error: ${err.message}`);
        }
    }

    console.log(`✅ DONE: Downloaded ${savedCount - 1} images`);
});