export default defineNuxtConfig({
    compatibilityDate: '2026-02-15',
    ssr: false,
    app: {
        baseURL: '/p1-rating-frontend/',
        buildAssetsDir: '/_nuxt/',
        head: {
            title: 'まつしげレーティング',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: 'まつしげレーティングシステム' }
            ],
            link: [
                { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@mdi/font@7.x/css/materialdesignicons.min.css' }
            ]
        }
    },
    css: [
        'vuetify/styles',
        '@mdi/font/css/materialdesignicons.css'
    ],
    build: {
        transpile: ['vuetify']
    },
    modules: [
        '@pinia/nuxt'
    ],
    vite: {
        ssr: {
            noExternal: ['vuetify']
        }
    },
    experimental: {
        payloadExtraction: false
    }
})
