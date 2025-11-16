// i18n Core Module
class I18n {
  constructor() {
    this.currentLang = this.detectLanguage();
    this.translations = {};
  }

  // Detect browser language
  detectLanguage() {
    // Check localStorage first
    const savedLang = localStorage.getItem('portfolio-lang');
    if (savedLang && (savedLang === 'en' || savedLang === 'zh-TW')) {
      return savedLang;
    }

    // Detect from browser
    const browserLang = navigator.language || navigator.userLanguage;
    
    // Check if browser language is Chinese (any variant)
    if (browserLang.startsWith('zh')) {
      // Prefer Traditional Chinese for zh-TW, zh-HK, zh-MO
      if (browserLang === 'zh-TW' || browserLang === 'zh-HK' || browserLang === 'zh-MO') {
        return 'zh-TW';
      }
      // For other Chinese variants, default to Traditional Chinese
      return 'zh-TW';
    }

    // Default to English
    return 'en';
  }

  // Initialize i18n system
  async init() {
    // Wait for DOM to be ready before hiding elements
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        if (document.readyState !== 'loading') {
          resolve();
        } else {
          document.addEventListener('DOMContentLoaded', resolve, { once: true });
        }
      });
    }
    
    // Hide translatable elements before loading translations to prevent flash of untranslated content
    this.hideTranslatableElements();
    
    // Load translation files
    await this.loadTranslations();
    
    // Update HTML lang attribute
    document.documentElement.lang = this.currentLang;
    
    // Update all translatable elements
    this.updatePage();
    
    // Show translatable elements after translation is complete
    this.showTranslatableElements();
  }

  // Hide translatable elements to prevent flash of untranslated content
  hideTranslatableElements() {
    // Only hide if DOM is ready
    if (document.readyState === 'loading') {
      // Mark that we need to hide elements later
      return;
    }
    
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      if (!element.hasAttribute('data-i18n-hidden')) {
        element.setAttribute('data-i18n-hidden', 'true');
        element.style.visibility = 'hidden';
      }
    });
  }

  // Show translatable elements after translation
  showTranslatableElements() {
    const elements = document.querySelectorAll('[data-i18n-hidden]');
    elements.forEach(element => {
      element.style.visibility = '';
      element.removeAttribute('data-i18n-hidden');
    });
  }

  // Load translation files
  async loadTranslations() {
    try {
      // Use vite-ignore for dynamic imports as Vite cannot statically analyze variable imports
      const langModule = await import(/* @vite-ignore */ `./${this.currentLang}.js`);
      this.translations = langModule.default || langModule;
      if (!this.translations || Object.keys(this.translations).length === 0) {
        throw new Error('Translations object is empty');
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to Traditional Chinese
      if (this.currentLang !== 'zh-TW') {
        try {
          this.currentLang = 'zh-TW';
          const langModule = await import('./zh-TW.js');
          this.translations = langModule.default || langModule;
          if (!this.translations || Object.keys(this.translations).length === 0) {
            throw new Error('Traditional Chinese translations also failed');
          }
        } catch (fallbackError) {
          console.error('Fallback to Traditional Chinese also failed:', fallbackError);
          // Set empty translations as last resort
          this.translations = {};
        }
      } else {
        // If Traditional Chinese already failed, set empty translations
        this.translations = {};
      }
    }
  }

  // Get translation for a key
  t(key, params = {}) {
    // Check if translations are loaded
    if (!this.translations || Object.keys(this.translations).length === 0) {
      console.warn('Translations not loaded yet, returning key:', key);
      return key;
    }
    
    const keys = key.split('.');
    let value = this.translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    // Replace parameters if any
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return value || key;
  }

  // Change language
  async changeLanguage(lang) {
    if (lang !== 'en' && lang !== 'zh-TW') {
      console.warn(`Unsupported language: ${lang}`);
      return;
    }

    const previousLang = this.currentLang;
    
    try {
      this.currentLang = lang;
      localStorage.setItem('portfolio-lang', lang);
      
      // Reload translations
      await this.loadTranslations();
      
      // Check if translations loaded successfully
      if (!this.translations || Object.keys(this.translations).length === 0) {
        console.error('Failed to load translations, reverting language change');
        // Revert to previous language
        this.currentLang = previousLang;
        await this.loadTranslations();
        // Ensure DOM is updated after revert
        document.documentElement.lang = previousLang;
        this.updatePage();
        // Trigger event to notify other modules of revert
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: previousLang } }));
        return;
      }
      
      // Update HTML lang attribute
      document.documentElement.lang = lang;
      
      // Update page content
      this.updatePage();
      
      // Trigger custom event for other modules
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    } catch (error) {
      console.error('Error changing language:', error);
      // Try to revert to previous language
      try {
        this.currentLang = previousLang;
        await this.loadTranslations();
        document.documentElement.lang = previousLang;
        this.updatePage();
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: previousLang } }));
      } catch (revertError) {
        console.error('Failed to revert language:', revertError);
      }
    }
  }

  // Update all translatable elements on the page
  updatePage() {
    // Update elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      // Skip welcome-text element - it will be handled by typing animation
      if (element.id === 'welcome-text') {
        return;
      }
      
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        // For input elements, update placeholder if data-i18n-placeholder exists
        if (element.hasAttribute('data-i18n-placeholder')) {
          // Don't update value, placeholder is handled separately
          return;
        } else {
          element.value = translation;
        }
      } else if (element.hasAttribute('data-i18n-html')) {
        // Update innerHTML
        element.innerHTML = translation;
      } else {
        // Update textContent
        element.textContent = translation;
      }
    });

    // Update elements with data-i18n-placeholder attribute
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.t(key);
    });

    // Update elements with data-i18n-title (for tooltips)
    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = this.t(key);
      element.setAttribute('title', translation);
      element.setAttribute('data-tooltip', translation);
    });

    // Update meta tags
    this.updateMetaTags();
  }

  // Update meta tags
  updateMetaTags() {
    const metaTitle = document.querySelector('meta[name="title"]');
    const metaDescription = document.querySelector('meta[name="description"]');
    const metaLanguage = document.querySelector('meta[name="language"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const pageTitle = document.querySelector('title');

    if (pageTitle && this.t('meta.title')) {
      pageTitle.textContent = this.t('meta.title');
    }
    if (metaTitle && this.t('meta.title')) {
      metaTitle.setAttribute('content', this.t('meta.title'));
    }
    if (metaDescription && this.t('meta.description')) {
      metaDescription.setAttribute('content', this.t('meta.description'));
    }
    if (metaLanguage) {
      metaLanguage.setAttribute('content', this.t('meta.language'));
    }
    if (ogTitle && this.t('meta.ogTitle')) {
      ogTitle.setAttribute('content', this.t('meta.ogTitle'));
    }
    if (ogDescription && this.t('meta.ogDescription')) {
      ogDescription.setAttribute('content', this.t('meta.ogDescription'));
    }
  }

  // Get current language
  getCurrentLanguage() {
    return this.currentLang;
  }
}

// Create global i18n instance (singleton pattern)
let i18nInstance = null;
let initPromise = null;

// Get i18n instance (returns Promise that resolves when initialized)
function getI18n() {
  if (!initPromise) {
    i18nInstance = new I18n();
    window.i18n = i18nInstance; // Keep global access for HTML onclick
    initPromise = i18nInstance.init(); // Return Promise for initialization
  }
  return initPromise.then(() => i18nInstance);
}

// Start initialization immediately
getI18n();

export default getI18n;

