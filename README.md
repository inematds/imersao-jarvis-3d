# Imersão Jarvis 3D

Você entra em um hangar, passa por 6 palcos e monta o seu Jarvis peça por peça. O evento nasce da área [Criando seu Jarvis](https://eventos.inema.pro/criando-seu-jarvis/) e foi construído pelo Codex com GPT-6.2 Astra em nível médio. Cada rodada fica registrada em `processo/`.

## O processo, do início ao fim

| Passo | O que acontece | Comando | Quem faz |
|---|---|---|---|
| 1 | Copiar a página-fonte, os logos e o Three.js | `fonte/`, `marca/`, `vendor/` | 🧠 sessão com o Nei |
| 2 | Escrever briefing, regras e validador | `processo/BRIEFING.md`, `tools/validar_conteudo.py` | 🧠 sessão com o Nei |
| 3 | Criar a programação | `tools/rodar_codex.sh processo/prompts/01-conteudo.md` | 🤖 Codex Astra médio |
| 4 | Conferir a programação com a fonte | `python3 tools/validar_conteudo.py` | ⚙️ script |
| 5 | Construir o hangar 3D e o modo sem 3D | `tools/rodar_codex.sh processo/prompts/02-mundo.md` | 🤖 Codex Astra médio |
| 6 | Testar no navegador e listar correções | navegador + `processo/revisoes/` | 🧠 sessão com o Nei |
| 7 | Aplicar as correções | `tools/rodar_codex.sh processo/prompts/03-correcoes.md` | 🤖 Codex Astra médio |
| 8 | Criar a página "Como foi feito" | `tools/rodar_codex.sh processo/prompts/04-processo.md` | 🤖 Codex Astra médio |
| 9 | Conferência final e aprovação do Nei | `python3 -m http.server 8765` | 🧠 sessão com o Nei |

## Como abrir

```bash
python3 -m http.server 8765
```

Depois abra `http://localhost:8765/`.

## Custo

`tools/resumir_rodada.py` grava tempo, tokens e custo equivalente de cada rodada em `processo/dados.json`. O uso real é pela assinatura do Codex, sem chave de API.
