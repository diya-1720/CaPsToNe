$pptxPath = Resolve-Path "AWEN_Hardware_Presentation_AF52.pptx"
$outFolder = Join-Path (Get-Location) "slide_images"

if (!(Test-Path $outFolder)) {
    New-Item -ItemType Directory -Path $outFolder | Out-Null
}

try {
    $ppt = New-Object -ComObject PowerPoint.Application
    $pres = $ppt.Presentations.Open($pptxPath, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
    
    $slideIndex = 1
    foreach ($slide in $pres.Slides) {
        $imgPath = Join-Path $outFolder ("slide_" + $slideIndex + ".png")
        $slide.Export($imgPath, "PNG", 1920, 1080)
        Write-Host "Exported slide $slideIndex to $imgPath"
        $slideIndex++
    }
    
    $pres.Close()
    $ppt.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
    Write-Host "All slides exported successfully."
} catch {
    Write-Host "PowerPoint COM export not available or failed: $_"
}
