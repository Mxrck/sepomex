type ChromeHighlightTheme =
  |"abap"
  |"algol"
  |"algol_nu"
  |"arduino"
  |"autumn"
  |"average"
  |"base16-snazzy"
  |"borland"
  |"bw"
  |"catppuccin-frappe"
  |"catppuccin-latte"
  |"catppuccin-macchiato"
  |"catppuccin-mocha"
  |"colorful"
  |"doom-one"
  |"doom-one2"
  |"dracula"
  |"emacs"
  |"friendly"
  |"fruity"
  |"github"
  |"github-dark"
  |"gruvbox"
  |"gruvbox-light"
  |"hr_high_contrast"
  |"hrdark"
  |"igor"
  |"lovelace"
  |"manni"
  |"modus-operandi"
  |"modus-vivendi"
  |"monokai"
  |"monokailight"
  |"murphy"
  |"native"
  |"nord"
  |"onedark"
  |"onesenterprise"
  |"paraiso-dark"
  |"paraiso-light"
  |"pastie"
  |"perldoc"
  |"pygments"
  |"rainbow_dash"
  |"rose-pine"
  |"rose-pine-dawn"
  |"rose-pine-moon"
  |"rrt"
  |"solarized-dark"
  |"solarized-dark256"
  |"solarized-light"
  |"swapoff"
  |"tango"
  |"tokyonight-day"
  |"tokyonight-moon"
  |"tokyonight-night"
  |"tokyonight-storm"
  |"trac"
  |"vim"
  |"vs"
  |"vulcan"
  |"witchhazel"
  |"xcode"
  |"xcode-dark"

type ChromaFormatterOptions = {
  formatter?: string,
  language?: string,
  theme?: ChromeHighlightTheme,
  lineNumbers?: boolean,
  lineNumbersInTable?: boolean,
}

export function chromaFormatter({
                                  formatter = 'html',
                                  lineNumbers = true,
                                  lineNumbersInTable = true,
                                  language = 'javascript',
                                  theme = 'rose-pine'
                                }: ChromaFormatterOptions): string {
  return `
    --formatter ${formatter} 
    --html-only 
    --html-inline-styles 
    ${lineNumbers ? '--html-lines' : ''} 
    ${lineNumbersInTable ? '--html-lines-table' : ''} 
    --lexer ${language} 
    --style "${theme}"
  `.replaceAll('\n', '').replaceAll('\r', '')
}