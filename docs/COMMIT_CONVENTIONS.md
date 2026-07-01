# Convenções de Commit — SchedlyOps

> Guia para mensagens de commit profissionais e consistentes.
> Vale para todos (humanos e agentes/Lovable) que commitam neste repositório.

## Formato (Conventional Commits)

```
<tipo>(<escopo opcional>): <resumo no imperativo, minúsculo, sem ponto final>

<corpo opcional: o PORQUÊ da mudança, não o "o quê" — o diff já mostra o quê>

<rodapé opcional: BREAKING CHANGE, refs de issue, co-autores>
```

- **Resumo (linha 1):** até ~72 caracteres, modo imperativo ("add", "fix", "update" — não "added"/"adds").
- **Linha em branco** obrigatória entre resumo e corpo.
- **Corpo:** explique a motivação e o contexto. Quebre linhas em ~72 colunas.
- **Idioma:** escolha um padrão e mantenha (recomendado: inglês no resumo técnico; PT-BR no corpo é aceitável).

## Tipos permitidos

| Tipo       | Quando usar                                                        |
|------------|-------------------------------------------------------------------|
| `feat`     | Nova funcionalidade visível ao usuário                            |
| `fix`      | Correção de bug                                                   |
| `style`    | Ajuste visual/CSS/UI sem mudança de lógica                        |
| `content`  | Texto, copy, SEO, traduções (i18n)                                |
| `docs`     | Documentação                                                      |
| `refactor` | Reestruturação sem mudar comportamento                            |
| `perf`     | Melhoria de performance                                           |
| `test`     | Adição/ajuste de testes                                           |
| `build`    | Build, dependências, config de bundler                            |
| `ci`       | Pipelines/automação                                               |
| `chore`    | Manutenção sem impacto em produção                                |

## Exemplos bons

```
style(hero): aumentar contraste do CTA primário

O botão principal ficava pouco visível em telas claras.
Ajusta o token de cor para atender AA de contraste.
```

```
content(seo): atualizar meta description e sitemap

Reflete o novo posicionamento da landing PT-BR.
```

```
fix(contact-form): validar e-mail antes do envio

Evita submissões com endereço inválido que falhavam na API de leads.
```

## Evite

- `Changes`, `update`, `wip`, `fix stuff` — mensagens vagas sem contexto.
- Vários assuntos não relacionados em um único commit. Prefira commits pequenos e coesos.
- Commitar artefatos de build (`.output/`, `dist/`) ou segredos (`.env` com valores reais).

## Regra do projeto

`develop` (no repo da organização Framixor) é um **espelho** do `main` pessoal; a
produção (`main`) entra **somente via Pull Request**. Mantenha o histórico do
`main` pessoal limpo e legível, pois é ele que é promovido para produção.
