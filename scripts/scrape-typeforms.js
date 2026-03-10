const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function scrapeTypeform(url, formName) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const referenceDir = path.join(process.cwd(), 'reference', formName);
  if (!fs.existsSync(referenceDir)) {
    fs.mkdirSync(referenceDir, { recursive: true });
  }

  console.log(`\n📋 Scraping: ${url}`);
  console.log(`📁 Saving to: ${referenceDir}\n`);

  const formData = {
    url,
    title: formName,
    steps: [],
    styles: {
      primaryColor: '',
      backgroundColor: '',
      textColor: '',
      buttonColor: '',
      fontFamily: ''
    }
  };

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Screenshot the initial state
    await page.screenshot({
      path: path.join(referenceDir, '00-initial.png'),
      fullPage: true
    });
    console.log('✅ Captured initial state');

    // Try to capture styles from the page
    const styles = await page.evaluate(() => {
      const computedStyles = {};

      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        const style = window.getComputedStyle(btn);
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          computedStyles.buttonColor = style.backgroundColor;
        }
      });

      const body = document.body;
      if (body) {
        const bodyStyle = window.getComputedStyle(body);
        computedStyles.backgroundColor = bodyStyle.backgroundColor;
        computedStyles.fontFamily = bodyStyle.fontFamily;
      }

      return computedStyles;
    });

    formData.styles = {
      primaryColor: styles.buttonColor || '#10b981',
      backgroundColor: styles.backgroundColor || '#ffffff',
      textColor: '#1f2937',
      buttonColor: styles.buttonColor || '#10b981',
      fontFamily: styles.fontFamily || 'system-ui, sans-serif'
    };

    let stepNumber = 0;
    let consecutiveNoProgress = 0;
    const maxSteps = 15;
    const maxNoProgress = 3;

    while (stepNumber < maxSteps && consecutiveNoProgress < maxNoProgress) {
      stepNumber++;

      await page.waitForTimeout(1500);

      // Capture screenshot
      await page.screenshot({
        path: path.join(referenceDir, `${String(stepNumber).padStart(2, '0')}-step.png`),
        fullPage: true
      });

      // Extract question and options
      const stepInfo = await page.evaluate(() => {
        const questionSelectors = [
          '[data-qa="question-title"]',
          '[class*="QuestionTitle"]',
          'h1',
          '[role="heading"]',
          '[class*="question"]'
        ];

        let questionText = '';
        for (const selector of questionSelectors) {
          const el = document.querySelector(selector);
          if (el && el.textContent) {
            questionText = el.textContent.trim();
            break;
          }
        }

        const options = [];
        const optionSelectors = [
          '[data-qa="choice"]',
          '[class*="Choice"]',
          '[role="option"]',
          'li[class*="choice"]',
          'button[class*="choice"]'
        ];

        for (const selector of optionSelectors) {
          const optionEls = document.querySelectorAll(selector);
          optionEls.forEach(el => {
            if (el.textContent) {
              options.push(el.textContent.trim());
            }
          });
          if (options.length > 0) break;
        }

        let fieldType = 'unknown';
        if (document.querySelector('input[type="text"]')) fieldType = 'text';
        else if (document.querySelector('input[type="email"]')) fieldType = 'email';
        else if (document.querySelector('input[type="tel"]')) fieldType = 'tel';
        else if (document.querySelector('input[type="number"]')) fieldType = 'number';
        else if (options.length > 0) fieldType = 'multiple_choice';
        else if (document.querySelector('select')) fieldType = 'dropdown';
        else if (document.querySelector('textarea')) fieldType = 'textarea';

        const input = document.querySelector('input, textarea');
        const placeholder = input?.placeholder || '';

        let buttonText = '';
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(btn => {
          if (btn.textContent) {
            const text = btn.textContent.trim();
            if (text && text.length < 50 && !buttonText) {
              buttonText = text;
            }
          }
        });

        return {
          questionText,
          options,
          fieldType,
          placeholder,
          buttonText
        };
      });

      console.log(`📸 Step ${stepNumber}: "${stepInfo.questionText.substring(0, 50)}..." (${stepInfo.fieldType})`);

      if (stepInfo.options.length > 0) {
        console.log(`   Options: ${stepInfo.options.slice(0, 5).join(', ')}${stepInfo.options.length > 5 ? '...' : ''}`);
      }

      formData.steps.push({
        stepNumber,
        questionText: stepInfo.questionText,
        fieldType: stepInfo.fieldType,
        options: stepInfo.options.length > 0 ? stepInfo.options : undefined,
        placeholder: stepInfo.placeholder || undefined,
        buttonText: stepInfo.buttonText || undefined
      });

      // Try to advance to next step
      const advanced = await tryAdvanceForm(page, stepInfo);

      if (!advanced) {
        consecutiveNoProgress++;
        console.log(`   ⚠️ Could not advance (attempt ${consecutiveNoProgress}/${maxNoProgress})`);
      } else {
        consecutiveNoProgress = 0;
      }

      // Check if we've reached the end
      const isEnd = await page.evaluate(() => {
        const thankYouIndicators = ['thank you', 'thanks', 'submitted', 'complete', 'success'];
        const pageText = document.body?.textContent?.toLowerCase() || '';
        return thankYouIndicators.some(indicator => pageText.includes(indicator));
      });

      if (isEnd) {
        console.log('✅ Reached end of form');
        break;
      }
    }

  } catch (error) {
    console.error('Error scraping form:', error);
  } finally {
    await browser.close();
  }

  fs.writeFileSync(
    path.join(referenceDir, 'form-data.json'),
    JSON.stringify(formData, null, 2)
  );
  console.log(`\n💾 Saved form data to ${formName}/form-data.json`);

  return formData;
}

async function tryAdvanceForm(page, stepInfo) {
  try {
    if (stepInfo.fieldType === 'multiple_choice' && stepInfo.options.length > 0) {
      const clicked = await page.evaluate(() => {
        const optionSelectors = [
          '[data-qa="choice"]',
          '[class*="Choice"]',
          '[role="option"]',
          'li[class*="choice"]',
          'button[class*="choice"]'
        ];

        for (const selector of optionSelectors) {
          const options = document.querySelectorAll(selector);
          if (options.length > 0) {
            options[0].click();
            return true;
          }
        }
        return false;
      });

      if (clicked) {
        await page.waitForTimeout(1000);
        return true;
      }
    }

    if (['text', 'email', 'tel', 'number'].includes(stepInfo.fieldType)) {
      const input = await page.$('input:not([type="hidden"])');
      if (input) {
        const testValues = {
          'text': 'Test User',
          'email': 'test@example.com',
          'tel': '07700900000',
          'number': '10000'
        };
        await input.fill(testValues[stepInfo.fieldType] || 'Test');
        await page.waitForTimeout(500);
      }
    }

    const buttonClicked = await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      for (const btn of allButtons) {
        if (btn.offsetParent !== null) {
          const text = btn.textContent?.toLowerCase() || '';
          if (text.includes('ok') || text.includes('next') || text.includes('continue') || text.includes('submit') || text.includes('start')) {
            btn.click();
            return true;
          }
        }
      }
      return false;
    });

    if (buttonClicked) {
      await page.waitForTimeout(1500);
      return true;
    }

    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    return true;
  } catch (error) {
    console.error('Error advancing form:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Typeform Scraper\n');
  console.log('='.repeat(50));

  const form1 = await scrapeTypeform('https://upsave.typeform.com/to/qS2Nsw', 'form1-qS2Nsw');
  const form2 = await scrapeTypeform('https://upsave.typeform.com/to/fCaQzF', 'form2-fCaQzF');

  const comparison = {
    form1: {
      url: form1.url,
      stepCount: form1.steps.length,
      steps: form1.steps.map(s => s.questionText.substring(0, 100))
    },
    form2: {
      url: form2.url,
      stepCount: form2.steps.length,
      steps: form2.steps.map(s => s.questionText.substring(0, 100))
    },
    differences: []
  };

  if (form1.steps.length !== form2.steps.length) {
    comparison.differences.push(`Different number of steps: Form1 has ${form1.steps.length}, Form2 has ${form2.steps.length}`);
  }

  const minSteps = Math.min(form1.steps.length, form2.steps.length);
  for (let i = 0; i < minSteps; i++) {
    if (form1.steps[i].questionText !== form2.steps[i].questionText) {
      comparison.differences.push(`Step ${i + 1} differs`);
    }
  }

  fs.writeFileSync(
    path.join(process.cwd(), 'reference', 'comparison.json'),
    JSON.stringify(comparison, null, 2)
  );

  console.log('\n' + '='.repeat(50));
  console.log('✅ Scraping complete!');
  console.log(`📁 Screenshots saved to /reference folder`);
  console.log(`📊 ${comparison.differences.length} differences found between forms`);
}

main().catch(console.error);
