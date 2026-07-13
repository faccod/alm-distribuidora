# Testa upload via curl
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap(100, 100)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::Red)
$g.Dispose()
$path = "$env:TEMP\test-upload-curl.png"
$bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Imagem criada: $path ($((Get-Item $path).Length) bytes)"

# Login pra pegar sessao
$login = Invoke-WebRequest -Uri "https://alm-distribuidora.vercel.app/api/login" -UseBasicParsing -Method Post -ContentType "application/json" -Body '{"email":"aurelio@alm.com","senha":"vendedor123"}' -SessionVariable sv
$cookie = ($sv.Cookies.GetCookies("https://alm-distribuidora.vercel.app") | Where-Object { $_.Name -eq "alm_session" }).Value
Write-Host "Cookie alm_session: $cookie"

# Upload via curl com o cookie
Write-Host "`n=== curl upload ==="
$escapedPath = $path -replace '\\', '\\'
curl.exe -i -X POST -b "alm_session=$cookie" -F "file=@$path;type=image/png" "https://alm-distribuidora.vercel.app/api/upload" 2>&1 | Select-Object -First 30

mavis-trash $path 2>&1 | Out-Null
