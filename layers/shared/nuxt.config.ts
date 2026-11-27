// Layer "shared" (T-0004, ADR 0002). Registra ui/ como pasta de componentes (T-0007): o Nuxt só
// auto-importa de components/ por padrão; um nome de pasta próprio precisa de registro explícito.
export default defineNuxtConfig({
  components: [{ path: './ui', pathPrefix: false }],
})
