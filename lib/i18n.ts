// This file no longer directly initializes i18n.
// The i18n instance is created and initialized in app/i18n-provider.tsx

import i18n from 'i18next';

export default i18n; // Export the raw i18n instance for type inference, but not for direct initialization. 