import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'

// T-0207 · REQ-02-06: "ao abrir um mega menu, os outros fecham" — um estado só, fornecido uma vez
// pelo cabeçalho (`fornecerCoordenadorMegaMenu`), lido por cada `MegaMenu`. Sem provedor acima
// (ex.: `MegaMenu.spec.ts` montando um só, isolado), cada instância coordena só consigo mesma —
// não é erro, só não há ninguém para fechar.
export type CoordenadorMegaMenu = { abertoId: Ref<symbol | null> }

const SIMBOLO_COORDENADOR_MEGA_MENU: InjectionKey<CoordenadorMegaMenu> =
  Symbol('coordenadorMegaMenu')

export function fornecerCoordenadorMegaMenu(): CoordenadorMegaMenu {
  const coordenador: CoordenadorMegaMenu = { abertoId: ref(null) }
  provide(SIMBOLO_COORDENADOR_MEGA_MENU, coordenador)
  return coordenador
}

export function useCoordenadorMegaMenu(): CoordenadorMegaMenu {
  // Fábrica (terceiro argumento `true`): sem provedor acima (ex.: MegaMenu.spec.ts montando um
  // só), cria um coordenador próprio em vez de avisar no console — não é erro, só não há
  // ninguém para fechar.
  return inject(SIMBOLO_COORDENADOR_MEGA_MENU, () => ({ abertoId: ref(null) }), true)
}
