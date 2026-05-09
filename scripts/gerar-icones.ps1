# Gera os icones usados pelo PWA a partir de icons/ac.jpeg.
# Para usar: no PowerShell, rode .\scripts\gerar-icones.ps1

$ErrorActionPreference = 'Stop'

$raizProjeto = Split-Path -Parent $PSScriptRoot
$imagemBase = Join-Path $raizProjeto 'icons\ac.jpeg'

if (-not (Test-Path $imagemBase)) {
    throw "Imagem base nao encontrada: $imagemBase"
}

Add-Type -AssemblyName System.Drawing

foreach ($tamanho in 192, 512) {
    $origem = [System.Drawing.Image]::FromFile($imagemBase)
    $icone = New-Object System.Drawing.Bitmap $tamanho, $tamanho
    $grafico = [System.Drawing.Graphics]::FromImage($icone)

    $grafico.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $grafico.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $grafico.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $grafico.DrawImage($origem, 0, 0, $tamanho, $tamanho)

    $saida = Join-Path $raizProjeto "icons\icon-$tamanho.png"
    $icone.Save($saida, [System.Drawing.Imaging.ImageFormat]::Png)

    $grafico.Dispose()
    $icone.Dispose()
    $origem.Dispose()

    Write-Host "Gerado: $saida"
}
