# Imersão Jarvis 3D

[![Imersão Jarvis 3D](guia/assets/banner.jpg)](https://inematds.github.io/imersao-jarvis-3d/guia/)

**🇧🇷 [Português](README.md) · 🇺🇸 [English](README.en.md) · 🇪🇸 [Español](README.es.md)**

## O que é

A Imersão Jarvis 3D é um evento grátis que abre no navegador. Ela serve para quem usa IA todo dia e queria um assistente só seu, aqui chamado de Jarvis. Você percorre 6 etapas em um hangar, um galpão virtual em 3D. Cada etapa traz vídeo ou material, uma tarefa e um sinal claro de que ficou pronta. O caminho leva a um assistente que lembra de você e pede o seu OK antes de uma ação de risco. Você visita o evento pelo computador ou pelo celular, e as tarefas de montagem são feitas no computador.

- **Entrar no evento:** https://eventos.inema.club/imersao-jarvis-3d/
- **Como foi feito:** https://eventos.inema.club/imersao-jarvis-3d/processo/
- **🎬 Vídeo:** https://www.youtube.com/watch?v=zH75hEE2pzE

## 📖 Guia de uso

Guia completo: **https://inematds.github.io/imersao-jarvis-3d/guia/**

## Quer transformar uma página sua em um lugar assim?

Abra o Claude Code ou o Codex na pasta do seu projeto e cole este pedido:

```text
Leia o projeto "Imersão Jarvis 3D" em https://github.com/inematds/imersao-jarvis-3d (comece pelo README) e veja o processo em https://eventos.inema.club/imersao-jarvis-3d/processo/.
Use esse projeto só como referência. Depois olhe a minha página neste projeto e me responda em português simples:
1. O que aqui poderia virar etapas, com material, tarefa e um sinal claro de "pronto"?
2. O que a pessoa veria avançar a cada etapa?
3. Vale a pena fazer em 3D, ou uma versão sem 3D resolve?
Não mude nada ainda. Mostre o plano e espere eu dizer sim.
```

---

## Instalação técnica

O evento é um site estático, sem etapa de build. Você precisa de Python 3 para servir os arquivos e de um navegador com WebGL para o modo 3D. Sem WebGL, o evento abre no modo sem 3D.

```bash
git clone https://github.com/inematds/imersao-jarvis-3d.git
cd imersao-jarvis-3d
python3 -m http.server 8791
```

Depois abra `http://localhost:8791/`.

Para abrir em outros aparelhos da rede, use o servidor que entrega só os arquivos públicos:

```bash
python3 tools/servir.py <ip-da-maquina> 8791
```

### Arquivos

| Caminho | O que guarda |
|---|---|
| `index.html`, `src/` | O evento: interface, mundo 3D, robô, controles e progresso |
| `conteudo/evento.json` | A programação: palcos, peças, materiais e textos |
| `fonte/` | A página de origem, única fonte do conteúdo |
| `vendor/three/` | Three.js, sem CDN |
| `processo/` | A página "Como foi feito", com pedidos, respostas, revisões e capturas |
| `tools/` | Validador, servidor local e execução das rodadas |
| `guia/` | Este guia em português, inglês e espanhol |

### Testes

```bash
python3 tools/validar_conteudo.py
for f in src/*.js; do node --check "$f"; done
```

### Custo

`tools/resumir_rodada.py` grava tempo, tokens e custo equivalente de cada rodada em `processo/dados.json`. O uso real é pela assinatura do Codex, sem chave de API.

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
| 8 | Dar acabamento ao robô, à luz e aos palcos | `tools/rodar_codex.sh processo/prompts/04-acabamento.md` | 🤖 Codex Astra médio |
| 8b | Corrigir o robô inicial e os enquadramentos | `tools/rodar_codex.sh processo/prompts/04b-ajustes.md` | 🤖 Codex Astra médio |
| 9 | Criar a página "Como foi feito" | `tools/rodar_codex.sh processo/prompts/05-processo.md` | 🤖 Codex Astra médio |
| 9b | Tocar o vídeo no telão do palco | `tools/rodar_codex.sh processo/prompts/06-video-no-telao.md` | 🤖 Codex Astra médio |
| 10 | Conferência final e aprovação do Nei | `python3 -m http.server 8791` | 🧠 sessão com o Nei |
| 11 | Publicar o evento em `eventos.inema.club` | `deploy/publicar.sh`, no projeto `eventos-inema-club` | ⚙️ script |
| 12 | Escrever o guia e traduzir para inglês e espanhol | `guia/`, `inema-traduz` | 🧠 sessão com o Nei |
| 13 | Publicar o guia e apontar o portal para ele | `git push` + skill `atualiza-portal` | 🧠 sessão com o Nei |
