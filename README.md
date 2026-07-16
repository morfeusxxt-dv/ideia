# Um Pequeno Universo para Jaci

Um site premium, altamente interativo e cinematográfico criado com **HTML5, CSS3 e JavaScript puro (vanilla)**, pronto para ser publicado na Vercel.

## Conceito

Inspirado na mitologia Tupi, onde **Jaci** representa a Lua, o site apresenta um cenário cósmico minimalista composto por:
* Céu estrelado responsivo com estrelas cadentes.
* Nebulosas suaves com gradientes interativos.
* Efeitos de parallax associados ao movimento do cursor.
* Efeitos de Glassmorphism e tipografia premium.
* Módulos interativos:
  1. **Intro & Transição**: Um zoom cinematográfico guiado pelo mouse.
  2. **Revelação**: Animação de digitação do nome acompanhada por faíscas cósmicas.
  3. **Carta**: Um envelope em 3D realista que se desdobra ao clique.
  4. **Jardim Interativo**: Um canvas onde cliques plantam flores dinâmicas que crescem e balançam ao vento.
  5. **Constelação de Qualidades**: Conecte estrelas que simbolizam qualidades únicas para formar uma constelação.
  6. **Agradecimento Final**: Uma lua ampliada brilhando com fogos e chuva de estrelas cadentes.

## Tecnologias Utilizadas

- **HTML5 & CSS3** (Vanilla)
- **JavaScript** (Vanilla)
- **GSAP** (via CDN) para timelines e interpolação de animações complexas.
- **Font Awesome** (via CDN) para ícones minimalistas.
- **Google Fonts** (Cormorant Garamond, Inter, Outfit).

## Estrutura do Projeto

```text
├── assets/
│   └── favicon.svg       # Favicon personalizado da Lua
├── index.html            # Estrutura principal & SEO
├── style.css             # Estilos do sistema visual
├── script.js             # Lógica e renderização das interações
└── README.md             # Instruções de uso e deploy
```

## Customização da Música

No canto superior direito, há um widget de áudio projetado para tocar uma música relaxante de fundo. 
Para adicionar sua própria música:
1. Copie o arquivo de áudio de sua escolha (no formato `.mp3`).
2. Cole-o na pasta `assets` e renomeie-o para `ambient.mp3` (ou altere o caminho correspondente na tag `<source>` no `index.html`).

## Segredos e Interações Ocultas (Easter Eggs)

1. **Console**: Abra a aba do Desenvolvedor (F12 ou Clique Direito -> Inspecionar -> Console) para ler uma mensagem oculta.
2. **Palavra-chave**: Digite a palavra `jaci` em qualquer momento no site para desencadear um colapso cósmico e uma chuva de estrelas.

## Como Executar Localmente

Basta abrir o arquivo [index.html](index.html) diretamente no seu navegador ou utilizar uma extensão como o *Live Server* do VS Code.

## Como Publicar na Vercel

1. Crie uma conta na [Vercel](https://vercel.com/).
2. Instale a CLI da Vercel ou importe este repositório diretamente do GitHub.
3. Clique em **Deploy**. O projeto está pronto e configurado para rodar perfeitamente sem necessidade de builds complexas.
