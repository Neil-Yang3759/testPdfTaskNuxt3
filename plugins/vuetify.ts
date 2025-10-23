// import this after install `@mdi/font` package
import "@mdi/font/css/materialdesignicons.css";

import "vuetify/styles";
import { createVuetify } from "vuetify";

export default defineNuxtPlugin((app) => {
    const vuetify = createVuetify({
        theme: {
            themes: {
                light: {
                    dark: false,
                    colors: {
                        primary: '#009149',
                        primaryCustom: '#009149',
                        // primary: '#0096c7',
                        primaryDarken: '#182b4d',
                        accent: '#9E9E9E',
                        secondary: '#FFD740',
                        info: '#26A69A',
                        warning: '#F57C00',
                        error: '#D50000',
                        success: '#4CAF50',
                    },
                },
            },
        },
        defaults: {
            global: {
            },
            VBtn: {
            },
        }
    });
    app.vueApp.use(vuetify);
});