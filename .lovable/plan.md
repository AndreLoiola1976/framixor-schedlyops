## Correção format-only do CI

Rodar os autofixers do projeto para limpar os erros de Prettier/ESLint, depois verificar.

### Passos

1. `bun run lint -- --fix` (ESLint com `eslint-plugin-prettier` reescreve os arquivos no formato correto).
2. Se algum arquivo ainda reportar `prettier/prettier`, rodar `bunx prettier --write` apenas nesses arquivos.
3. `bun run lint` — deve sair limpo.
4. `bun run test` — deve continuar verde.
5. `bun run typecheck` como sanity check.

### Guardrails

- Sem edições manuais. Só o output do formatter é commitado.
- Sem mudanças em `.prettierrc`, `.prettierignore`, `eslint.config.js` ou expectativas de teste.
- Se um teste quebrar de verdade por causa de snapshot/string tocado pelo formatter, paro e reporto — não "conserto" o teste.
- Se o lint reportar violações não-formatação (ex.: `react-hooks/*`, `no-restricted-imports`), paro e reporto; estão fora do escopo desse pass.

### Entregável

Lista dos arquivos reescritos pelo formatter e o resultado final de `lint` e `test`.
